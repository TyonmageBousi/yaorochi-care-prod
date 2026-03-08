import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { stockTakes, stockTakeLines, items, stockTransactions, ITEM_STATUS_FLAGS } from "@/db/schema";
import { BusinessValidationError } from "@/types/handleApiErrorType";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";

type Params = {
    facilityId: number;
    storageId: number;
    notes?: string | null;
    userId: number;
};

export async function createStockTakeLine({ facilityId, storageId, notes, userId }: Params) {
    const itemRows = await db.query.items.findMany({
        where: and(
            eq(items.facilityId, facilityId),
            eq(items.status, ITEM_STATUS_FLAGS.ACTIVE)
        ),
        columns: { id: true },
        with: {
            stockTransactions: {
                where: and(
                    eq(stockTransactions.facilityId, facilityId),
                    eq(stockTransactions.storageId, storageId)
                ),
                columns: { id: true },
                limit: 1,
            },
        },
    });

    const targetItemIds = itemRows
        .filter((item) => item.stockTransactions.length > 0)
        .map((item) => item.id);

    if (targetItemIds.length === 0) {
        throw new BusinessValidationError(
            "指定した保管場所に在庫がある商品が見つかりません",
            404,
            "NOT_FOUND"
        );
    }

    // まとめて在庫取得
    const systemQtyMap = await getCurrentStockQtyByItemIds(facilityId, targetItemIds);

    const targetItems = targetItemIds.map((itemId) => ({
        itemId,
        systemQty: systemQtyMap.get(itemId) ?? 0,
    }));

    const stockTakeId = await db.transaction(async (tx) => {
        const [createdStockTake] = await tx
            .insert(stockTakes)
            .values({
                facilityId,
                storageId,
                notes: notes ?? null,
                createdBy: userId,
            })
            .returning({ id: stockTakes.id });

        await tx.insert(stockTakeLines).values(
            targetItems.map((item) => ({
                stockTakeId: createdStockTake.id,
                itemId: item.itemId,
                systemQty: item.systemQty,
                countedQty: null,
                adjustmentTxId: null,
            }))
        );

        return createdStockTake.id;
    });

    return stockTakeId;
}
// src/lib/repositories/confirmStockTake.ts

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { BusinessValidationError } from "@/types/handleApiErrorType";
import { stockTakes, stockTakeLines, STOCKTAKE_STATUS, stockTransactions, STOCK_TX_TYPE } from "@/db/schema";

export async function confirmStockTake(stockTakeId: number, facilityId: number) {
    await db.transaction(async (tx) => {
        const [stockTake] = await tx
            .select({ id: stockTakes.id, status: stockTakes.status, storageId: stockTakes.storageId })
            .from(stockTakes)
            .where(
                and(
                    eq(stockTakes.id, stockTakeId),
                    eq(stockTakes.facilityId, facilityId)
                )
            );

        if (!stockTake) {
            throw new BusinessValidationError(
                "棚卸が見つかりません",
                404,
                "NOT_FOUND"
            );
        }

        if (stockTake.status !== STOCKTAKE_STATUS.IN_PROGRESS) {
            throw new BusinessValidationError(
                "この棚卸は既に確定済みまたは中止されています",
                400,
                "INVALID_STATUS"
            );
        }

        const lines = await tx
            .select({
                id: stockTakeLines.id,
                itemId: stockTakeLines.itemId,
                countedQty: stockTakeLines.countedQty,
                systemQty: stockTakeLines.systemQty,
            })
            .from(stockTakeLines)
            .where(eq(stockTakeLines.stockTakeId, stockTake.id));

        const hasUncounted = lines.some((line) => line.countedQty === null);

        if (hasUncounted) {
            throw new BusinessValidationError(
                "未入力の明細があります",
                400,
                "UNCOUNTED_LINES"
            );
        }

        const adjustmentTx = await tx
            .insert(stockTransactions)
            .values(
                lines.map((line) => ({
                    facilityId,
                    itemId: line.itemId,
                    type: STOCK_TX_TYPE.STOCKTAKE,
                    qty: line.countedQty! - line.systemQty,
                    storageId: stockTake.storageId,
                }))
            )
            .returning({ id: stockTransactions.id });

        await Promise.all(
            lines.map((line, i) =>
                tx
                    .update(stockTakeLines)
                    .set({ adjustmentTxId: adjustmentTx[i].id })
                    .where(eq(stockTakeLines.id, line.id))
            )
        );

        await tx
            .update(stockTakes)
            .set({
                status: STOCKTAKE_STATUS.POSTED,
                postedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(stockTakes.id, stockTake.id));
    });
}
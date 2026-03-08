import "server-only";
import { db } from "@/db/index";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ITEM_STATUS_FLAGS } from "@/db/schema";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";

export async function getAllItemInventory(facilityId: number) {
    const rows = await db
        .select({
            id: items.id,
            itemCode: items.itemCode,
            name: items.name,
            unit: items.unit,
            status: items.status,
            parLevel: items.parLevel,
            reorderPoint: items.reorderPoint,
            imageUrl: items.imageUrl,
            notes: items.notes,
        })
        .from(items)
        .where(and(eq(items.facilityId, facilityId), eq(items.status, ITEM_STATUS_FLAGS.ACTIVE)));

    // まとめて在庫取得
    const itemIds = rows.map(row => row.id);
    const stockMap = await getCurrentStockQtyByItemIds(facilityId, itemIds);

    return rows.map(row => ({
        ...row,
        currentStock: stockMap.get(row.id) ?? 0,
    }));
}

export type GetAllItemResult = Awaited<ReturnType<typeof getAllItemInventory>>;
export type GetItemResult = GetAllItemResult[number];
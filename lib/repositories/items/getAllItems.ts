import "server-only";
import { db } from "@/db/index";
import { items } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";
import { ITEM_STATUS_FLAGS } from "@/db/schema"

// 取得（Stockなし）
export async function getItemOptions(facilityId: number) {
    return await db
        .select({
            id: items.id,
            name: items.name,
            imageUrl: items.imageUrl,
        })
        .from(items)
        .where(
            and(
                eq(items.facilityId, facilityId),
                eq(items.status, ITEM_STATUS_FLAGS.ACTIVE)
            )
        ).orderBy(asc(items.name));
}

// 取得（Stockあり）
export async function getItemOptionsWithStock(facilityId: number) {
    const opts = await getItemOptions(facilityId);

    // まとめて在庫取得（N+1回避）
    const itemIds = opts.map(opt => opt.id);
    const stockMap = await getCurrentStockQtyByItemIds(facilityId, itemIds);

    return opts.map(opt => ({
        ...opt,
        currentStockQty: stockMap.get(opt.id) ?? 0,
    }));
}

export type ItemOptionsWithStock = Awaited<ReturnType<typeof getItemOptionsWithStock>>;
export type ItemOptionWithStock = ItemOptionsWithStock[number];
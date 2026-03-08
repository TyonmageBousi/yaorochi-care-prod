import { db } from "@/db";
import { items, storageLocations } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";
import type { BusinessErrors } from "../../../types/handleApiErrorType";
import { OutBoundRow } from "@/lib/validations/outBound";


export async function validateMasterData(
    facilityId: number,
    rows: OutBoundRow[],
): Promise<BusinessErrors> {
    const itemIds = [...new Set(rows.map(r => r.itemId))];
    const storageIds = [...new Set(rows.map(r => r.storageId))];

    const [itemRows, storageRows] = await Promise.all([
        db.select({ id: items.id })
            .from(items)
            .where(and(eq(items.facilityId, facilityId), inArray(items.id, itemIds))),
        db.select({ id: storageLocations.id })
            .from(storageLocations)
            .where(and(eq(storageLocations.facilityId, facilityId), inArray(storageLocations.id, storageIds))),
    ]);

    const itemSet = new Set(itemRows.map(i => i.id));
    const storageSet = new Set(storageRows.map(s => s.id));

    return rows.reduce<BusinessErrors>((errors, row, i) => {
        if (!itemSet.has(row.itemId)) {
            errors[`rows.${i}.itemId`] = ["物品が見つかりません（商品マスタから削除された可能性があります）"];
        }
        if (!storageSet.has(row.storageId)) {
            errors[`rows.${i}.storageId`] = ["保管場所が見つかりません（商品マスタから削除された可能性があります）"];
        }
        return errors;
    }, {});
}


export async function validateStock(facilityId: number, rows: OutBoundRow[]): Promise<BusinessErrors> {
    const aggregated = aggregateByKey(rows);
    const itemIds = aggregated.map(r => r.itemId); 

    const stockMap = await getCurrentStockQtyByItemIds(facilityId, itemIds); 
    const errors: BusinessErrors = {};

    for (const { itemId, qty } of aggregated) {
        const currentStock = stockMap.get(itemId) ?? 0; 
        if (qty > currentStock) {
            const i = rows.findIndex(row => row.itemId === itemId);
            errors[`rows.${i}.qty`] = [`在庫が不足しています（必要: ${qty}、在庫: ${currentStock}）`];
        }
    }

    return errors;
}

export function aggregateByKey(rows: OutBoundRow[]) {
    const map = new Map<string, { itemId: number; storageId: number; qty: number }>();

    for (const row of rows) {
        const key = `${row.itemId}:${row.storageId}`;
        const prev = map.get(key);
        map.set(key, prev
            ? { ...prev, qty: prev.qty + row.qty }
            : { itemId: row.itemId, storageId: row.storageId, qty: row.qty }
        );
    }

    return [...map.values()];
}

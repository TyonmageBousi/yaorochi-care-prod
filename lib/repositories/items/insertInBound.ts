import { db } from "@/db";
import { stockTransactions, STOCK_TX_TYPE } from "@/db/schema";
import { InBoundRow } from "@/lib/validations/inBound";
import { items, storageLocations } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function makeSelectChain(
    facilityId: number,
    itemIds: number[],
    storageIds: number[]
) {
    const [itemRows, storageRows] = await Promise.all([
        db.select({ id: items.id })
            .from(items)
            .where(and(eq(items.facilityId, facilityId), inArray(items.id, itemIds))),
        db.select({ id: storageLocations.id })
            .from(storageLocations)
            .where(and(eq(storageLocations.facilityId, facilityId), inArray(storageLocations.id, storageIds))),
    ]);

    return { itemRows, storageRows };
}

export async function insertInBoundTransactions(
    facilityId: number,
    performedBy: number,
    rows: InBoundRow[]
) {
    const insertValues = rows.map(row => ({
        facilityId,
        itemId: row.itemId,
        type: STOCK_TX_TYPE.IN,
        qty: row.qty,
        storageId: row.storageId,
        residentName: null,
        notes: row.notes ?? null,
        performedBy,
    }));

    await db.transaction(async (tx) => {
        await tx.insert(stockTransactions).values(insertValues);
    });

    return insertValues.length;
}
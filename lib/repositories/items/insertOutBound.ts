// src/lib/repositories/stockRepository.ts
import { db } from "@/db";
import { stockTransactions, STOCK_TX_TYPE } from "@/db/schema";
import { OutBoundRow } from "@/lib/validations/outBound";

export async function insertOutBoundTransactions(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    facilityId: number,
    performedBy: number,
    residentName: string | null,
    rows: OutBoundRow[]
) {
    await tx.insert(stockTransactions).values(
        rows.map(row => ({
            facilityId,
            itemId: row.itemId,
            type: STOCK_TX_TYPE.OUT,
            qty: row.qty,
            storageId: row.storageId,
            residentName,
            notes: row.notes ?? null,
            performedBy,
        }))
    );
}

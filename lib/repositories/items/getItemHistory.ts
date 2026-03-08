import { db } from "@/db/index";
import { stockTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StockTxType } from "@/db/schema";

export type ItemHistoryRow = {
    txId: number;
    itemName: string;
    itemCode: string;
    type: StockTxType;
    qty: number;
    unit: number;
    createdBy: string | null;
    performedAt: Date;
};

export async function getItemHistory(facilityId: number, limit?: number): Promise<ItemHistoryRow[]> {
    const rows = await db.query.stockTransactions.findMany({
        where: eq(stockTransactions.facilityId, facilityId),
        orderBy: (t, { desc }) => desc(t.performedAt),
        limit,
        columns: {
            id: true,
            type: true,
            qty: true,
            performedAt: true,
        },
        with: {
            item: {
                columns: {
                    name: true,
                    itemCode: true,
                    unit: true,
                },
            },
            performedByUser: {
                columns: {
                    name: true,
                },
            },
        },
    });
    return rows.map((row) => ({
        txId: row.id,
        itemName: row.item.name,
        itemCode: row.item.itemCode,
        type: row.type as StockTxType,
        qty: row.qty,
        unit: row.item.unit,
        createdBy: row.performedByUser?.name ?? null,
        performedAt: row.performedAt,
    }));

}
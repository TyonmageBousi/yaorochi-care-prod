import "server-only";
import { db } from "@/db/index";
import { stockTransactions } from "@/db/schema";
import { and, eq, sql, inArray } from "drizzle-orm";
import { STOCK_TX_TYPE } from "@/db/schema";

export async function getCurrentStockQtyByItemIds(
    facilityId: number,
    itemIds: number[],
    storageId?: number,
): Promise<Map<number, number>> {
    // 空配列の場合は早期リターン
    if (itemIds.length === 0) return new Map();

    const stockQtyExpr = sql<number>`
        coalesce(sum(
            case
                when ${stockTransactions.type} = ${STOCK_TX_TYPE.IN} then ${stockTransactions.qty}
                when ${stockTransactions.type} in (${STOCK_TX_TYPE.OUT}, ${STOCK_TX_TYPE.WASTE}) then -${stockTransactions.qty}
                when ${stockTransactions.type} in (${STOCK_TX_TYPE.ADJUST}, ${STOCK_TX_TYPE.STOCKTAKE}) then ${stockTransactions.qty}
                else 0
            end
        ), 0)
    `.as("stockQty");

    const rows = await db
        .select({ itemId: stockTransactions.itemId, stockQty: stockQtyExpr })
        .from(stockTransactions)
        .where(
            and(
                eq(stockTransactions.facilityId, facilityId),
                storageId ? eq(stockTransactions.storageId, storageId) : undefined,
                inArray(stockTransactions.itemId, itemIds)
            )
        )
        .groupBy(stockTransactions.itemId);

    return new Map(rows.map(r => [r.itemId, Number(r.stockQty)]));
}
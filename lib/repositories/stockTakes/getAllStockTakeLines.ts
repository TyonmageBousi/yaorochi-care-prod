import "server-only";
import { db } from "@/db/index";
import { eq, and, asc } from "drizzle-orm";
import { stockTakes, stockTakeLines } from "@/db/schema";

export async function getAllStockTakeLines(facilityId: number, stockTakeId: number, statusId: number) {
    const row = await db.query.stockTakes.findFirst({
        where: and(
            eq(stockTakes.id, stockTakeId),
            eq(stockTakes.facilityId, facilityId),
            eq(stockTakes.status, statusId)
        ),
        with: {
            lines: {
                orderBy: [asc(stockTakeLines.id)],
                columns: {
                    id: true,
                    systemQty: true,
                    countedQty: true,
                    adjustmentTxId: true,
                },
                with: {
                    item: {
                        columns: {
                            itemCode: true,
                            name: true,
                            imageUrl: true,
                        },
                    },
                },
            },
        },
        columns: {
            id: true,
            startedAt: true,
        },
    });

    if (!row) return [];

    return row.lines.map(line => {
        const { item, ...rest } = line;
        return {
            ...rest,
            name: item.name,
            imageUrl: item.imageUrl,
            itemCode: item.itemCode,
        };
    });
}

export type GetStockTakeWithLinesResult = Awaited<ReturnType<typeof getAllStockTakeLines>>;
// src/lib/repositories/stockTakes/deleteStockTakeLine.ts

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { stockTakes, stockTakeLines } from "@/db/schema";
import { BusinessValidationError } from "@/types/handleApiErrorType";

type Params = {
    stockTakeId: number;
    facilityId: number;
    lineId: number;
};

export async function deleteStockTakeLine({ stockTakeId, facilityId, lineId }: Params) {
    await db.transaction(async (tx) => {
        const [stockTake] = await tx
            .select({ id: stockTakes.id })
            .from(stockTakes)
            .where(
                and(
                    eq(stockTakes.id, stockTakeId),
                    eq(stockTakes.facilityId, facilityId)
                )
            );

        if (!stockTake) {
            throw new BusinessValidationError("棚卸が見つかりません", 404, "NOT_FOUND");
        }

        const result = await tx
            .delete(stockTakeLines)
            .where(
                and(
                    eq(stockTakeLines.id, lineId),
                    eq(stockTakeLines.stockTakeId, stockTake.id)
                )
            )
            .returning({ id: stockTakeLines.id });

        if (result.length === 0) {
            throw new BusinessValidationError("削除する明細が見つかりません", 404, "NOT_FOUND");
        }
    });
}
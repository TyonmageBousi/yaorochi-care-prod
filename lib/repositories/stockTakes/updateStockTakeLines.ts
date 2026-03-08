// src/lib/repositories/updateStockTakeLines.ts

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { stockTakeLines, stockTakes } from "@/db/schema";
import { BusinessValidationError } from "@/types/handleApiErrorType";
import { LineServerValue } from "@/lib/validations/stock-takes/stockTakeCountSchema";

type Params = {
    stockTakeId: number;
    facilityId: number;
    lines: LineServerValue[];
};

export async function updateStockTakeLines({ stockTakeId, facilityId, lines }: Params) {
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

        await Promise.all(
            lines.map((line) =>
                tx
                    .update(stockTakeLines)
                    .set({
                        countedQty: line.countedQty ?? null,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(stockTakeLines.stockTakeId, stockTake.id),
                            eq(stockTakeLines.id, line.lineId)
                        )
                    )
            )
        );
    });
}
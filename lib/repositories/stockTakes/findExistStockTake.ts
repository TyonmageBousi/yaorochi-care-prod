import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { stockTakes, STOCKTAKE_STATUS } from "@/db/schema";

export async function findExistStockTake(storageId: number, facilityId: number) {
    // ── 重複チェック ──
    const [existStockTake] = await db
        .select({
            id: stockTakes.id,
            storageId: stockTakes.storageId,
            startedAt: stockTakes.startedAt
        })
        .from(stockTakes)
        .where(
            and(
                eq(stockTakes.facilityId, facilityId),
                eq(stockTakes.storageId, storageId),
                eq(stockTakes.status, STOCKTAKE_STATUS.IN_PROGRESS)
            )
        )
        .limit(1);

    return existStockTake ?? undefined;
}

export type ProgressStockTake = Awaited<ReturnType<typeof findExistStockTake>>;

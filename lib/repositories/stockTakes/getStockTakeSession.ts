
import { and, eq, not } from "drizzle-orm";
import { db } from "@/db";
import { stockTakes, STOCKTAKE_STATUS } from "@/db/schema";

type Params = {
    stockTakeId: number;
    facilityId: number;
};

export async function getStockTakeSession({ stockTakeId, facilityId }: Params) {
    const [stockTakeStatus] = await db
        .select({ status: stockTakes.status })
        .from(stockTakes)
        .where(
            and(
                eq(stockTakes.id, stockTakeId),
                eq(stockTakes.facilityId, facilityId),
                not(eq(stockTakes.status, STOCKTAKE_STATUS.POSTED))
            )
        );
    return stockTakeStatus;
}
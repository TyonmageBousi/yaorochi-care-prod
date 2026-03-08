import { db } from "@/db";
import { assets } from "@/db/schema";
import { and, eq, not } from "drizzle-orm";

export async function findExistsAssetCode(
    facilityId: number,
    assetCode: string,
    assetId?: number  
): Promise<boolean> {

    const conditions = [
        eq(assets.facilityId, facilityId),
        eq(assets.assetCode, assetCode),
    ];

    if (assetId) {
        conditions.push(not(eq(assets.id, assetId)));
    }

    const existingAsset = await db.query.assets.findFirst({
        where: and(...conditions),
    });

    return existingAsset !== undefined;
}
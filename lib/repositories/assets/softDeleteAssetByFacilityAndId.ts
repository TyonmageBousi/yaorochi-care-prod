import { db } from "@/db/index";
import { assets, ASSET_STATUS } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function softDeleteAssetByFacilityAndId(
    facilityId: number,
    assetId: number
): Promise<boolean> {
    const [row] = await db
        .update(assets)
        .set({ status: ASSET_STATUS.RETIRED })
        .where(
            and(
                eq(assets.facilityId, facilityId),
                eq(assets.id, assetId)
            )
        ).returning({ id: assets.id });

    return row ? true : false;
}

export type SoftDeleteAssetByFacilityAndIdResult = Awaited<
    ReturnType<typeof softDeleteAssetByFacilityAndId>
>;
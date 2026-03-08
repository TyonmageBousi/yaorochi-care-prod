import "server-only";
import { db } from "@/db/index";
import { assets } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { ASSET_STATUS } from "@/db/schema"
export async function getAsset(facilityId: number, assetId: number) {
    const rows = await db
        .select({
            id: assets.id,
            name: assets.name,
            categoryId: assets.categoryId,
            currentStorageId: assets.currentStorageId,
            owner: assets.owner,
            roomNumberId: assets.roomNumberId,
            status: assets.status,
            imageUrl: assets.imageUrl,
            notes: assets.notes,
        })
        .from(assets)
        .where(
            and(
                eq(assets.facilityId, facilityId),
                eq(assets.id, assetId),
                not(eq(assets.status, ASSET_STATUS.RETIRED))
            )
        )
        .limit(1);

    return rows[0] ?? null;
}

export type GetAssetResult = Awaited<ReturnType<typeof getAsset>>;

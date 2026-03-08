import "server-only";
import { db } from "@/db/index";
import { assets } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { ASSET_STATUS } from "@/db/schema"

export async function getAllAssets(facilityId: number) {
    return await db
        .select({
            id: assets.id,
            assetCode: assets.assetCode,
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
                inArray(assets.status, [ASSET_STATUS.IN_USE, ASSET_STATUS.IN_STORAGE, ASSET_STATUS.MAINTENANCE]),
            )
        );
}

export type ListAssetsResult = Awaited<ReturnType<typeof getAllAssets>>;
export type AssetListRow = ListAssetsResult[number];
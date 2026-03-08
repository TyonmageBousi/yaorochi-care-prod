// src/lib/repositories/assets/updateAsset.ts
import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CareAssetRequest } from "@/lib/validations/asset";
import { BusinessValidationError } from "@/types/handleApiErrorType";

export async function updateAsset(assetId: number, facilityId: number, asset: CareAssetRequest, imageUrl?: string) {
    const [updated] = await db
        .update(assets)
        .set({
            assetCode: asset.assetCode,
            name: asset.name,
            categoryId: asset.categoryId,
            currentStorageId: asset.storageId,
            roomNumberId: asset.roomNumberId ?? null,
            owner: asset.owner,
            status: asset.status,
            imageUrl: imageUrl ?? null,
            notes: asset.notes ?? null,
            updatedAt: new Date(),
        })
        .where(and(eq(assets.id, assetId), eq(assets.facilityId, facilityId)))
        .returning();

    if (!updated) {
        throw new BusinessValidationError("資産が見つかりません", 404, "NOT_FOUND");
    }
}
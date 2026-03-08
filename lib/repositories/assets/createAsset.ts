import { db } from "@/db";
import { assets } from "@/db/schema";
import { CareAssetRequest } from "@/lib/validations/asset";
import { BusinessValidationError } from "@/types/handleApiErrorType";

export async function createAsset(newAsset: CareAssetRequest, facilityId: number, imageUrl?: string) {
    const [asset] = await db.insert(assets).values({
        facilityId,
        assetCode: newAsset.assetCode,
        name: newAsset.name,
        categoryId: newAsset.categoryId,
        currentStorageId: newAsset.storageId,
        roomNumberId: newAsset.roomNumberId ?? null,
        owner: newAsset.owner,
        status: newAsset.status,
        imageUrl: imageUrl ?? null,
        notes: newAsset.notes ?? null,
    }).returning();

    if (!asset) {
        throw new BusinessValidationError("資産の登録に失敗しました", 500, "SERVER_ERROR");
    }
}
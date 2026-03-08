import "server-only";

import { OWNER_TYPE_STR, ASSET_STATUS_STR } from "@/lib/validations/asset";
import type { GetAssetResult } from "@/lib/repositories/assets/getAsset";                  // DB型
import type { CareAssetValues } from "@/lib/validations/asset"; // 実パスに合わせて
import { FindItemByFacilityAndIdResult } from "@/lib/repositories/items/findItemByFacilityAndId";

type DefaultData = Partial<CareAssetValues>;

const toIdStr = (n: number) => String(n);
const toOptIdStr = (n: number | null | undefined) => (n == null ? undefined : String(n));
const toNotes = (s: string | null | undefined) => s ?? "";

export function ownerToStr(owner: number): CareAssetValues["owner"] {
    switch (owner) {
        case 1: return OWNER_TYPE_STR.FACILITY; // "1"
        case 2: return OWNER_TYPE_STR.RENTAL;   // "2"
        default: return OWNER_TYPE_STR.FACILITY;
    }
}

export function statusToStr(status: number): CareAssetValues["status"] {
    switch (status) {
        case 1: return ASSET_STATUS_STR.IN_USE;
        case 2: return ASSET_STATUS_STR.IN_STORAGE;
        case 3: return ASSET_STATUS_STR.MAINTENANCE;
        case 4: return ASSET_STATUS_STR.RETIRED;
        default: return ASSET_STATUS_STR.IN_USE;
    }
}

export function mapAssetToFormDefaultValues(asset: GetAssetResult) {
    return {
        id: asset.id,
        name: asset.name,
        categoryId: toIdStr(asset.categoryId),
        storageId: toIdStr(asset.currentStorageId),
        owner: ownerToStr(asset.owner),
        status: statusToStr(asset.status),
        roomNumberId: toOptIdStr(asset.roomNumberId),
        imageUrl: asset.imageUrl,
        notes: toNotes(asset.notes),

    };
}

export type AssetDefaultData = ReturnType<typeof mapAssetToFormDefaultValues>;


export function mapItemToFormDefaultValues(item: FindItemByFacilityAndIdResult) {
    return {
        name: item.name,
        itemCode: item.itemCode,
        unit: String(item.unit),
        parLevel: item.parLevel ?? undefined,
        reorderPoint: item.reorderPoint ?? undefined,
        imageUrl: item.imageUrl,
        notes: toNotes(item.notes),

    };
}

export type ItemDefaultData = ReturnType<typeof mapItemToFormDefaultValues>;
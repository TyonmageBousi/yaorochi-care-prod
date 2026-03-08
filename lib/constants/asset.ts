import { OWNER_TYPE, ASSET_STATUS } from "@/db/schema"
import { RadioOption } from "@/components/form/RadioForm";


// ========================================
// 定数定義（ロジック用）
// ========================================

export type AssetStatus = typeof ASSET_STATUS[keyof typeof ASSET_STATUS];
export type OwnerType = typeof OWNER_TYPE[keyof typeof OWNER_TYPE];


// ========================================
// UI表示用配列（フォーム用）
// ========================================
export const assetStatuses: RadioOption[] = [
    { id: ASSET_STATUS.IN_USE, label: "使用中" },
    { id: ASSET_STATUS.IN_STORAGE, label: "保管中" },
    { id: ASSET_STATUS.MAINTENANCE, label: "点検/修理中" },
    { id: ASSET_STATUS.RETIRED, label: "廃棄/除籍" },
];

export const owners: RadioOption[] = [
    { id: OWNER_TYPE.FACILITY, label: "ホーム" },
    { id: OWNER_TYPE.RENTAL, label: "レンタル" },
];
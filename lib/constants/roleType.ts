import { Options } from "@/components/form/OptionsForm"
import { ROLE } from "@/db/schema";

// ========================================
// UI表示用配列（フォーム用）
// ========================================

export const owners: Options[] = [
    { id: ROLE.ADMIN, label: "ホーム" },
    { id: ROLE.MANAGER, label: "事務" },
    { id: ROLE.STAFF, label: "スタッフ" },
];


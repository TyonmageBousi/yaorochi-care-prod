import { z } from "zod";
import {
    emptyToUndefined,
    requiredTrimmedString,
    coerceInt,
    fileOrUndefined,
} from "@/lib/validations/normalizers";
import { ASSET_STATUS, OWNER_TYPE } from "@/db/schema"


// 数値から文字列版を自動生成（select の value と合わせるため）
export const OWNER_TYPE_STR = Object.fromEntries(
    Object.entries(OWNER_TYPE).map(([k, v]) => [k, String(v)])
) as { [K in keyof typeof OWNER_TYPE]: string };

export const ASSET_STATUS_STR = Object.fromEntries(
    Object.entries(ASSET_STATUS).map(([k, v]) => [k, String(v)])
) as { [K in keyof typeof ASSET_STATUS]: string };

export type AssetStatus = typeof ASSET_STATUS[keyof typeof ASSET_STATUS];
export type OwnerType = typeof OWNER_TYPE[keyof typeof OWNER_TYPE];

const ownerValues = [OWNER_TYPE_STR.FACILITY, OWNER_TYPE_STR.RENTAL] as const;
const statusValues = [
    ASSET_STATUS_STR.IN_USE,
    ASSET_STATUS_STR.IN_STORAGE,
    ASSET_STATUS_STR.MAINTENANCE,
    ASSET_STATUS_STR.RETIRED,
] as const;

// サーバー用：文字列を数値に変換後に検証
const ownerSchema = z.union([
    z.literal(OWNER_TYPE.FACILITY),
    z.literal(OWNER_TYPE.RENTAL),
], { message: "所有者を選択してください" });

const statusSchema = z.union([
    z.literal(ASSET_STATUS.IN_USE),
    z.literal(ASSET_STATUS.IN_STORAGE),
    z.literal(ASSET_STATUS.MAINTENANCE),
    z.literal(ASSET_STATUS.RETIRED),
], { message: "ステータスを選択してください" });

const careAssetBaseSchema = z.object({
    assetCode: z.string().min(1, "資産コードを入力してください").max(50, "資産コードは50文字以内で入力してください"),
    name: z.string().min(1, "資産名を入力してください").max(50, "資産名は50文字以内で入力してください"),
    serialNumber: z.string().optional(),
    categoryId: z.string().min(1, "カテゴリを選択してください"),
    storageId: z.string().min(1, "保存場所を選択してください"),
    owner: z.enum(ownerValues, { message: "所有者を選択してください" }),
    status: z.enum(statusValues, { message: "ステータスを選択してください" }),
    roomNumberId: z.string().optional(),
    notes: z.string().max(100, "備考は100文字以内で入力してください").optional(),
    image: z
        .instanceof(File, { message: "画像ファイルをアップロードしてください" })
        .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: "画像は5MB以下にしてください",
        })
        .optional(), imageUrl: z.string().nullable().optional(),
});

// レンタル品は居室必須
const rentalRefinement = (
    data: { owner: string; roomNumberId?: string },
    ctx: z.RefinementCtx
) => {
    if (data.owner === OWNER_TYPE_STR.RENTAL && !data.roomNumberId) {
        ctx.addIssue({
            code: "custom",
            message: "レンタル品の場合は部屋番号を選択してください",
            path: ["roomNumberId"],
        });
    }
};

// フロント用
export const careAssetFormSchema = careAssetBaseSchema.superRefine(rentalRefinement);
export type CareAssetValues = z.infer<typeof careAssetFormSchema>;
export type CareAssetFormKey = keyof CareAssetValues;

// サーバー用（文字列IDを数値に変換）
export const careAssetRequestSchema = careAssetBaseSchema.extend({
    assetCode: requiredTrimmedString.pipe(z.string().max(50, "資産コードは50文字以内で入力してください")),
    name: requiredTrimmedString,
    categoryId: coerceInt.pipe(z.number().int().min(1, "カテゴリを選択してください")),
    storageId: coerceInt.pipe(z.number().int().min(1, "保存場所を選択してください")),
    owner: coerceInt.pipe(ownerSchema),
    status: coerceInt.pipe(statusSchema),
    roomNumberId: z.preprocess(
        emptyToUndefined,
        coerceInt.pipe(z.number().int().min(1, "部屋番号を選択してください")).optional()
    ),
    notes: z.preprocess(emptyToUndefined, z.string().optional()),
    image: fileOrUndefined,
    imageUrl: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
    if (data.owner === OWNER_TYPE.RENTAL && data.roomNumberId == null) {
        ctx.addIssue({
            code: "custom",
            message: "レンタル品の場合は部屋番号を選択してください",
            path: ["roomNumberId"],
        });
    }
});

export type CareAssetRequest = z.infer<typeof careAssetRequestSchema>;
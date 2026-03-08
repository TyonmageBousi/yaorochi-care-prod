import { z } from "zod";
import {
    emptyToUndefined,
    requiredTrimmedString,
    coerceInt,
    fileOrUndefined,
} from "@/lib/validations/normalizers";

const itemBaseSchema = z.object({
    itemCode: z.string().min(1, "品目コードを入力してください").max(50, "品目コードは50文字以内で入力してください"),
    name: z.string().min(1, "品目名を入力してください").max(50, "品目名は50文字以内で入力してください"),
    unit: z.string().min(1, "管理単位を選択してください"),
    parLevel: z.number().int().min(0).optional(),
    reorderPoint: z.number().int().min(0).optional(),
    notes: z.string().optional(),
    image: z
        .instanceof(File, { message: "画像ファイルをアップロードしてください" })
        .refine((file) => file.size <= 5 * 1024 * 1024, {
            message: "画像は5MB以下にしてください",
        })
        .optional(), imageUrl: z.string().nullable().optional(),
    storageId: z.number().int().positive().optional(),
    initialQty: z.number().int().min(0).optional(),
});

const parLevelRefine = (data: { parLevel?: number; reorderPoint?: number }, ctx: z.RefinementCtx) => {
    if (
        data.parLevel != null &&
        data.reorderPoint != null &&
        data.reorderPoint > data.parLevel
    ) {
        ctx.addIssue({
            code: "custom",
            path: ["reorderPoint"],
            message: "発注点は適正在庫以下に設定してください",
        });
    }
};

// フロント用
export const itemFormSchema = itemBaseSchema.superRefine(parLevelRefine);
export type ItemValues = z.infer<typeof itemFormSchema>;
export type ItemFormKey = keyof ItemValues;

// サーバー用（文字列IDを数値に変換）
export const consumableItemRequestSchema = itemBaseSchema.extend({
    itemCode: requiredTrimmedString.pipe(z.string().max(50, "品目コードは50文字以内で入力してください")),
    name: requiredTrimmedString,
    unit: z.preprocess(emptyToUndefined, coerceInt.pipe(z.number().int().min(1, "管理単位を選択してください"))),
    parLevel: z.preprocess(emptyToUndefined, coerceInt.pipe(z.number().int().min(0)).optional()), // ← これが抜けてた
    reorderPoint: z.preprocess(emptyToUndefined, coerceInt.pipe(z.number().int().min(0)).optional()),
    notes: z.preprocess(emptyToUndefined, z.string().optional()),
    image: fileOrUndefined,
    imageUrl: z.string().nullable().optional(),
    storageId: z.preprocess(emptyToUndefined, coerceInt.pipe(z.number().int().positive()).optional()),
    initialQty: z.preprocess(emptyToUndefined, coerceInt.pipe(z.number().int().min(0)).optional()),
}).superRefine(parLevelRefine);

export type ConsumableItemRequest = z.infer<typeof consumableItemRequestSchema>;
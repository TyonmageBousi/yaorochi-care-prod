import { z } from "zod";
import { coerceInt } from "./normalizers";

const inBoundRowBaseSchema = z.object({
    itemId: z.number().int().min(1, "商品を選択してください"),
    storageId: z.string().min(1, "保管場所を選択してください"),
    qty: z.coerce.number<number>({ error: "数量を入力してください" })
        .int()
        .min(1, "数量は1以上である必要があります"),
    notes: z.string().optional(),
});

// フロント用
export const inBoundFormSchema = z.object({
    rows: z.array(inBoundRowBaseSchema).min(1, "少なくとも1つの商品を追加してください"),
});

export type InBoundValues = z.infer<typeof inBoundFormSchema>;
export type InBoundRowValues = z.infer<typeof inBoundRowBaseSchema>;
export type InBoundRowKey = keyof InBoundRowValues;

// サーバー用（文字列IDを数値に変換）
export const inBoundRequestSchema = z.object({
    rows: z.array(
        inBoundRowBaseSchema.extend({
            itemId: coerceInt.pipe(z.number().int().min(1, "商品を選択してください")),
            storageId: coerceInt.pipe(z.number().int().min(1, "保管場所を選択してください")),
            qty: coerceInt.pipe(z.number().int().min(1, "数量は1以上である必要があります")),
        })
    ).min(1, "少なくとも1つの商品を追加してください"),
});

export type InBoundRequest = z.infer<typeof inBoundRequestSchema>;
export type InBoundRow = InBoundRequest["rows"][number];
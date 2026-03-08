import { z } from "zod";
import { coerceInt } from "./normalizers";

// ベース定義
const outBoundRowBaseSchema = z.object({
    itemId: z.number().int().min(1, "商品を選択してください"),
    storageId: z.string().min(1, "保管場所を選択してください"),
    qty: z.coerce.number<number>({ error: "数量を入力してください" })
        .int()
        .min(1, "数量は1以上である必要があります"),
    notes: z.string().optional(),
});

// フロント用
export const outboundFormSchema = z.object({
    roomId: z.string().min(1, "部屋を選択してください"),
    rows: z.array(outBoundRowBaseSchema).min(1, "払出明細は1件以上必要です"),
});

export type OutBoundValues = z.infer<typeof outboundFormSchema>;
export type OutBoundRowValues = z.infer<typeof outBoundRowBaseSchema>;

// サーバー用（文字列IDを数値に変換）
export const outboundRequestSchema = outboundFormSchema.extend({
    roomId: coerceInt.pipe(z.number().int().min(1, "部屋を選択してください")),
    rows: z.array(
        outBoundRowBaseSchema.extend({
            itemId: coerceInt.pipe(z.number().int().min(1, "商品を選択してください")),
            storageId: coerceInt.pipe(z.number().int().min(1, "保管場所を選択してください")),
            qty: coerceInt.pipe(z.number().int().min(1, "数量は1以上である必要があります")),
        })
    ).min(1, "払出明細は1件以上必要です"),
});

export type OutBoundRequest = z.infer<typeof outboundRequestSchema>;
export type OutBoundRow = OutBoundRequest["rows"][number];
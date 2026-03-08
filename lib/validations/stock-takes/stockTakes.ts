import { z } from "zod";
import { emptyToUndefined, coerceInt } from "@/lib/validations/normalizers";

// フロント用
export const stockTakeFormSchema = z.object({
    storageId: z.string({ message: "保管場所を選択してください" }).min(1, "保管場所を選択してください"),
    notes: z.string().max(500, "備考は500文字以内で入力してください").optional(),
});

export type StockTakeFormValues = z.infer<typeof stockTakeFormSchema>;

// サーバー用
export const stockTakeRequestSchema = stockTakeFormSchema.extend({
    storageId: coerceInt.pipe(z.number().int().positive("有効な保管場所を選択してください")),
    notes: z.preprocess(emptyToUndefined, z.string().max(500).optional()),
});

export type StockTakeRequest = z.infer<typeof stockTakeRequestSchema>;
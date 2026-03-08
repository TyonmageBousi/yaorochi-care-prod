import { z } from "zod";

const stockTakeCountRowSchema = z.object({
    lineId: z.number().int().positive(),
    countedQty: z
        .number()
        .int("整数を入力してください")
        .min(0, "0以上の整数を入力してください")
        .optional(),
});

export const stockTakeCountSchema = z.object({
    lines: z.array(stockTakeCountRowSchema).min(1, "カウント明細が存在しません"),
});

export type StockTakeCountValues = z.infer<typeof stockTakeCountSchema>;
export type LineServerValue = StockTakeCountValues["lines"][number];

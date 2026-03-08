import { z } from "zod";

const residentRowBaseSchema = z.object({
residentName: z.string().max(100).nullable(),
});

// フロント用（roomId は string のまま）
export const residentRowFormSchema = residentRowBaseSchema.extend({
    roomId: z.string().min(1, "部屋を選択してください"),
});

export const residentFormSchema = z.object({
    rows: z.array(residentRowFormSchema).min(1, "1件以上登録してください"),
});

export type ResidentValues = z.infer<typeof residentFormSchema>;
export type ResidentRowValues = z.infer<typeof residentRowFormSchema>;

// サーバー用（roomId を数値に変換）
export const residentRowRequestSchema = residentRowBaseSchema.extend({
    roomId: z.coerce.number().int().min(1, "部屋を選択してください"),
});

export const residentRequestSchema = z.object({
    rows: z.array(residentRowRequestSchema).min(1, "1件以上登録してください"),
});

export type ResidentRowRequest = z.infer<typeof residentRowRequestSchema>;
export type ResidentRequest = z.infer<typeof residentRequestSchema>;
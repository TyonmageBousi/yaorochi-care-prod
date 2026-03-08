import { z } from "zod";

const noLineBreak = (s: string) => !/[\r\n\t]/.test(s);

export const roomNumberFormSchema = z.object({
    label: z
        .string()
        .trim()
        .min(1, "部屋番号を入力してください")
        .max(50, "部屋番号は50文字以内で入力してください")
        .refine(noLineBreak, "改行やタブは使用できません"),
    notes: z
        .string()
        .trim()
        .max(2000, "備考は2000文字以内で入力してください")
        .optional(),
});

export type RoomNumberFormValue = z.infer<typeof roomNumberFormSchema>;
export type RoomNumberFormKey = keyof RoomNumberFormValue;
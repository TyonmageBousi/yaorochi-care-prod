import { z } from "zod";

export const loginSchema = z.object({
    userId: z
        .string()
        .min(1, "ユーザーIDを入力してください")
        .max(20, "ユーザーIDは20文字以内である必要があります")
        .regex(/^[a-zA-Z0-9_-]+$/, "ユーザーIDは英数字、ハイフン、アンダースコアのみ使用できます"),
    password: z
        .string()
        .min(6, "パスワードは6文字以上である必要があります"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

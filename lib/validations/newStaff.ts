import { z } from "zod";
import { ROLE } from "@/db/schema";

// ROLEの数値を文字列に変換（select の value と合わせるため）
const toEnumValues = (obj: Record<string, number>) =>
    Object.values(obj).map(String) as [string, ...string[]];

const roleEnumValues = toEnumValues(ROLE);

const staffBaseSchema = z.object({
    userId: z
        .string()
        .min(1, "スタッフIDを入力してください")
        .max(20, "スタッフIDは20文字以内で入力してください")
        .regex(/^[A-Za-z0-9-_]+$/, "スタッフIDは半角英数字、ハイフン、アンダースコアのみ使用できます"),
    name: z
        .string()
        .min(1, "氏名を入力してください")
        .max(100, "氏名は100文字以内で入力してください"),
    password: z
        .string()
        .min(8, "パスワードは8文字以上で入力してください")
        .max(100, "パスワードは100文字以内で入力してください")
        .regex(/[a-z]/, "パスワードには小文字の英字を含めてください")
        .regex(/[A-Z]/, "パスワードには大文字の英字を含めてください")
        .regex(/[0-9]/, "パスワードには数字を含めてください"),
    passwordConfirm: z
        .string()
        .min(1, "パスワード（確認）を入力してください"),
    phone: z
        .string()
        .min(1, "電話番号を入力してください")
        .regex(/^[0-9-]+$/, "電話番号は数字とハイフンのみ使用できます")
        .refine(
            (val) => {
                const digits = val.replace(/-/g, "");
                return digits.length >= 10 && digits.length <= 11;
            },
            { message: "電話番号は10桁または11桁で入力してください" }
        ),
    role: z.enum(roleEnumValues, { message: "権限を選択してください" }),
    hireDate: z
        .string()
        .min(1, "入社日を入力してください")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "有効な日付を入力してください"),
});

// パスワード一致チェック
const passwordConfirmRefine = <T extends { password: string; passwordConfirm: string }>(data: T) =>
    data.password === data.passwordConfirm;

const passwordConfirmRefineOption = {
    message: "パスワードが一致しません",
    path: ["passwordConfirm"],
};

// フロント用
export const staffRegisterFormSchema = staffBaseSchema.refine(passwordConfirmRefine, passwordConfirmRefineOption);
export type StaffRegisterValues = z.infer<typeof staffRegisterFormSchema>;
export type StaffRegisterFormKey = keyof StaffRegisterValues;

// サーバー用（role・facilityId を数値に、hireDate を Date に変換）
export const staffRegisterRequestSchema = staffBaseSchema.extend({
    role: staffBaseSchema.shape.role.pipe(z.coerce.number()),
    hireDate: staffBaseSchema.shape.hireDate.pipe(z.coerce.date()),
}).refine(passwordConfirmRefine, passwordConfirmRefineOption);

export type StaffRegisterRequest = z.infer<typeof staffRegisterRequestSchema>;
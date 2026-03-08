import { z } from "zod";

/**
 * null / undefined / 空白文字列 → undefined に統一
 * FormData.get() の null や select の "" を未入力として扱う
 */
export const emptyToUndefined = (v: unknown) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string" && v.trim() === "") return undefined;
    return v;
};

/**
 * 空白のみの文字列を未入力扱いにし、trim済み文字列を保証する必須スキーマ
 * DB保存時の余計な空白混入を防ぐ
 */
export const requiredTrimmedString = z.preprocess((v) => {
    if (typeof v !== "string") return v;
    const t = v.trim();
    return t === "" ? undefined : t;
}, z.string().min(1));

/**
 * 文字列 → number 変換（小数OK）
 * 空入力は NaN にして 0 誤認を防ぐ
 */
export const coerceNumber = z.preprocess((v) => {
    if (typeof v === "string") return v.trim() === "" ? NaN : Number(v);
    return v;
}, z.number());

/**
 * 文字列 → 整数変換
 * 空入力は NaN にして 0 誤認を防ぐ
 */
export const coerceInt = z.preprocess((v) => {
    if (typeof v === "string") return v.trim() === "" ? NaN : Number(v);
    return v;
}, z.number().int());

/**
 * File のみ通し、それ以外は undefined にする（任意ファイル用）
 */
export const fileOrUndefined = z.preprocess(
    (v) => (v instanceof File ? v : undefined),
    z.instanceof(File).optional()
);

/**
 * 空入力は undefined、文字列数字は number(int) に変換する任意IDスキーマ
 * select の value や FormData 由来の値を number | undefined に正規化する
 */
export const coerceOptionalInt = z
    .preprocess((v) => {
        const u = emptyToUndefined(v);
        if (u === undefined) return undefined;
        if (typeof u === "string") return Number(u);
        return u;
    }, z.number().int())
    .optional();
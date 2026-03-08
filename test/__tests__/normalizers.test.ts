import { emptyToUndefined, coerceNumber, coerceInt, coerceOptionalInt, requiredTrimmedString } from "@/lib/validations/normalizers";

// ─── emptyToUndefined ───────────────────────────────────────────────────────
describe("emptyToUndefined", () => {
  it("nullはundefinedを返す", () => {
    expect(emptyToUndefined(null)).toBeUndefined();
  });
  it("undefinedはundefinedを返す", () => {
    expect(emptyToUndefined(undefined)).toBeUndefined();
  });
  it("空文字はundefinedを返す", () => {
    expect(emptyToUndefined("")).toBeUndefined();
  });
  it("スペースのみはundefinedを返す", () => {
    expect(emptyToUndefined("   ")).toBeUndefined();
  });
  it("通常の文字列はそのまま返す", () => {
    expect(emptyToUndefined("hello")).toBe("hello");
  });
  it("数値はそのまま返す", () => {
    expect(emptyToUndefined(0)).toBe(0);
    expect(emptyToUndefined(42)).toBe(42);
  });
  it("falseはそのまま返す", () => {
    expect(emptyToUndefined(false)).toBe(false);
  });
});

// ─── requiredTrimmedString ───────────────────────────────────────────────────
describe("requiredTrimmedString", () => {
  it("通常文字列はパースに成功する", () => {
    const result = requiredTrimmedString.safeParse("hello");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("hello");
  });
  it("前後のスペースをtrimする", () => {
    const result = requiredTrimmedString.safeParse("  hello  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("hello");
  });
  it("空文字はバリデーションエラー", () => {
    expect(requiredTrimmedString.safeParse("").success).toBe(false);
  });
  it("スペースのみはバリデーションエラー", () => {
    expect(requiredTrimmedString.safeParse("   ").success).toBe(false);
  });
});

// ─── coerceNumber ───────────────────────────────────────────────────────────
describe("coerceNumber", () => {
  it("数値文字列をnumberに変換する", () => {
    const result = coerceNumber.safeParse("3.14");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(3.14);
  });
  it("整数文字列をnumberに変換する", () => {
    const result = coerceNumber.safeParse("10");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(10);
  });
  it("空文字はNaNになりバリデーションエラー", () => {
    expect(coerceNumber.safeParse("").success).toBe(false);
  });
  it("数値はそのまま通る", () => {
    const result = coerceNumber.safeParse(42);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(42);
  });
  it("文字列はバリデーションエラー", () => {
    expect(coerceNumber.safeParse("abc").success).toBe(false);
  });
});

// ─── coerceInt ───────────────────────────────────────────────────────────────
describe("coerceInt", () => {
  it("整数文字列をintに変換する", () => {
    const result = coerceInt.safeParse("5");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(5);
  });
  it("小数文字列はバリデーションエラー（int制約）", () => {
    expect(coerceInt.safeParse("1.5").success).toBe(false);
  });
  it("空文字はバリデーションエラー", () => {
    expect(coerceInt.safeParse("").success).toBe(false);
  });
  it("数値はそのまま通る", () => {
    const result = coerceInt.safeParse(7);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(7);
  });
});

// ─── coerceOptionalInt ───────────────────────────────────────────────────────
describe("coerceOptionalInt", () => {
  it("整数文字列をnumberに変換する", () => {
    const result = coerceOptionalInt.safeParse("3");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(3);
  });
  it("空文字はバリデーションエラーになる（preprocessでundefined変換後にz.number()が拒否）", () => {
    const result = coerceOptionalInt.safeParse("");
    expect(result.success).toBe(false);
  });
  it("nullはバリデーションエラーになる（preprocessでundefined変換後にz.number()が拒否）", () => {
    const result = coerceOptionalInt.safeParse(null);
    expect(result.success).toBe(false);
  });
  it("undefinedはundefinedになる", () => {
    const result = coerceOptionalInt.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBeUndefined();
  });
});

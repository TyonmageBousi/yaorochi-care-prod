import { buildFieldErrors } from "@/lib/services/common/handleZodErrors";
import { z } from "zod";

const getIssues = (schema: z.ZodTypeAny, data: unknown) => {
  const result = schema.safeParse(data);
  if (result.success) throw new Error("バリデーション成功してしまった");
  return result.error.issues;
};

describe("buildFieldErrors", () => {
  it("単一フィールドのエラーをまとめる", () => {
    const schema = z.object({ name: z.string().min(1, "名前を入力してください") });
    const issues = getIssues(schema, { name: "" });
    const errors = buildFieldErrors(issues);

    expect(errors["name"]).toEqual(["名前を入力してください"]);
  });

  it("複数フィールドのエラーを別々にまとめる", () => {
    const schema = z.object({
      name: z.string().min(1, "名前を入力してください"),
      email: z.string().email("メールアドレスが不正です"),
    });
    const issues = getIssues(schema, { name: "", email: "invalid" });
    const errors = buildFieldErrors(issues);

    expect(errors["name"]).toContain("名前を入力してください");
    expect(errors["email"]).toContain("メールアドレスが不正です");
  });

  it("ネストされたフィールドのパスをドット区切りにする", () => {
    const schema = z.object({
      rows: z.array(z.object({ qty: z.number().min(1, "1以上を入力") })),
    });
    const issues = getIssues(schema, { rows: [{ qty: 0 }] });
    const errors = buildFieldErrors(issues);

    expect(errors["rows.0.qty"]).toContain("1以上を入力");
  });

  it("同一フィールドに複数エラーがある場合まとめて配列にする", () => {
    const schema = z.object({
      password: z.string().min(8, "8文字以上").regex(/[A-Z]/, "大文字を含めてください"),
    });
    const issues = getIssues(schema, { password: "abc" });
    const errors = buildFieldErrors(issues);

    expect(errors["password"].length).toBeGreaterThan(1);
  });

  it("issuesが空の場合は空オブジェクトを返す", () => {
    const errors = buildFieldErrors([]);
    expect(errors).toEqual({});
  });
});

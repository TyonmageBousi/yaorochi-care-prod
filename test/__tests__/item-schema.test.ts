import { consumableItemRequestSchema } from "@/lib/validations/item";

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const parse = (data: unknown) => consumableItemRequestSchema.safeParse(data);

const errPaths = (result: ReturnType<typeof parse>) =>
  result.success ? [] : result.error.issues.map((i) => i.path.join("."));

const validBase = {
  itemCode: "ITEM-001",
  name: "マスク",
  unit: "1",
};

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("consumableItemRequestSchema", () => {
  describe("正常系", () => {
    it("最小構成で成功", () => {
      const result = parse(validBase);
      expect(result.success).toBe(true);
    });

    it("parLevel・reorderPoint両方ありで成功（reorderPoint <= parLevel）", () => {
      const result = parse({ ...validBase, parLevel: "10", reorderPoint: "5" });
      expect(result.success).toBe(true);
    });

    it("parLevel === reorderPointで成功", () => {
      const result = parse({ ...validBase, parLevel: "5", reorderPoint: "5" });
      expect(result.success).toBe(true);
    });

    it("parLevel・reorderPointが空文字の場合undefinedになる", () => {
      const result = parse({ ...validBase, parLevel: "", reorderPoint: "" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parLevel).toBeUndefined();
        expect(result.data.reorderPoint).toBeUndefined();
      }
    });

    it("notesが空文字の場合undefinedになる", () => {
      const result = parse({ ...validBase, notes: "" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.notes).toBeUndefined();
    });

    it("parLevel・reorderPointが文字列数値の場合numberに変換される", () => {
      const result = parse({ ...validBase, parLevel: "10", reorderPoint: "3" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parLevel).toBe(10);
        expect(result.data.reorderPoint).toBe(3);
      }
    });
  });

  describe("parLevel / reorderPoint の関係チェック", () => {
    it("reorderPoint > parLevel の場合エラー", () => {
      const result = parse({ ...validBase, parLevel: "5", reorderPoint: "10" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("reorderPoint");
    });

    it("reorderPointのみ指定（parLevelなし）はエラーにならない", () => {
      const result = parse({ ...validBase, reorderPoint: "3" });
      expect(result.success).toBe(true);
    });

    it("parLevelのみ指定（reorderPointなし）はエラーにならない", () => {
      const result = parse({ ...validBase, parLevel: "10" });
      expect(result.success).toBe(true);
    });
  });

  describe("必須フィールドバリデーション", () => {
    it("itemCodeが空の場合エラー", () => {
      const result = parse({ ...validBase, itemCode: "" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("itemCode");
    });

    it("itemCodeが51文字以上の場合エラー", () => {
      const result = parse({ ...validBase, itemCode: "a".repeat(51) });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("itemCode");
    });

    it("nameが空の場合エラー", () => {
      const result = parse({ ...validBase, name: "" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("name");
    });

    it("unitが空の場合エラー", () => {
      const result = parse({ ...validBase, unit: "" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("unit");
    });

    it("parLevelが負の数の場合エラー", () => {
      const result = parse({ ...validBase, parLevel: "-1" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("parLevel");
    });

    it("reorderPointが負の数の場合エラー", () => {
      const result = parse({ ...validBase, reorderPoint: "-1" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("reorderPoint");
    });
  });
});

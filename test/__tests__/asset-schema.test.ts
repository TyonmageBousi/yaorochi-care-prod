import { careAssetRequestSchema } from "@/lib/validations/asset";

jest.mock("@/db/schema", () => ({
  ASSET_STATUS: { IN_USE: 1, IN_STORAGE: 2, MAINTENANCE: 3, RETIRED: 4 },
  OWNER_TYPE: { FACILITY: 1, RENTAL: 2 },
}));

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const parse = (data: unknown) => careAssetRequestSchema.safeParse(data);

const errPaths = (result: ReturnType<typeof parse>) =>
  result.success ? [] : result.error.issues.map((i) => i.path.join("."));

const validBase = {
  assetCode: "ASSET-001",
  name: "車椅子A",
  categoryId: "1",
  storageId: "2",
  owner: "1",   // FACILITY
  status: "1",  // IN_USE
};

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("careAssetRequestSchema", () => {
  describe("正常系", () => {
    it("施設所有・roomNumberIdなしで成功", () => {
      const result = parse(validBase);
      expect(result.success).toBe(true);
    });

    it("categoryId・storageIdがnumberに変換される", () => {
      const result = parse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBe(1);
        expect(result.data.storageId).toBe(2);
      }
    });

    it("レンタル品・roomNumberIdありで成功", () => {
      const result = parse({ ...validBase, owner: "2", roomNumberId: "3" });
      expect(result.success).toBe(true);
    });

    it("notesが空文字の場合undefinedになる", () => {
      const result = parse({ ...validBase, notes: "" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.notes).toBeUndefined();
    });

    it("roomNumberIdが空文字の場合undefinedになる", () => {
      const result = parse({ ...validBase, roomNumberId: "" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.roomNumberId).toBeUndefined();
    });
  });

  describe("レンタル品の居室必須チェック", () => {
    it("レンタル品でroomNumberIdがない場合エラー", () => {
      const result = parse({ ...validBase, owner: "2" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("roomNumberId");
    });

    it("レンタル品でroomNumberIdが空文字の場合エラー", () => {
      const result = parse({ ...validBase, owner: "2", roomNumberId: "" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("roomNumberId");
    });

    it("施設所有でroomNumberIdがなくてもエラーにならない", () => {
      const result = parse({ ...validBase, owner: "1" });
      expect(result.success).toBe(true);
    });
  });

  describe("必須フィールドバリデーション", () => {
    it("assetCodeが空の場合エラー", () => {
      const result = parse({ ...validBase, assetCode: "" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("assetCode");
    });

    it("assetCodeが51文字以上の場合エラー", () => {
      const result = parse({ ...validBase, assetCode: "a".repeat(51) });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("assetCode");
    });

    it("nameが空の場合エラー", () => {
      const result = parse({ ...validBase, name: "" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("name");
    });

    it("不正なownerの場合エラー", () => {
      const result = parse({ ...validBase, owner: "99" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("owner");
    });

    it("不正なstatusの場合エラー", () => {
      const result = parse({ ...validBase, status: "99" });
      expect(result.success).toBe(false);
      expect(errPaths(result)).toContain("status");
    });
  });
});

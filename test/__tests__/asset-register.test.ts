import { NextRequest } from "next/server";
import { POST as POSTNew } from "@/app/api/asset/register/new/route";
import { POST as POSTUpdate } from "@/app/api/asset/register/[id]/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/assets/createAsset", () => ({
  createAsset: jest.fn(),
}));
jest.mock("@/lib/repositories/assets/updateAsset", () => ({
  updateAsset: jest.fn(),
}));
jest.mock("@/lib/repositories/assets/findExistsAssetCode", () => ({
  findExistsAssetCode: jest.fn(),
}));
jest.mock("@/storage/storage", () => ({
  insertStorage: jest.fn(),
  deleteStorage: jest.fn(),
}));
jest.mock("server-only", () => ({}));
jest.mock("@/db", () => ({ db: {} }));
jest.mock("@/db/index", () => ({ db: {} }));
jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/db/schema", () => ({
  ASSET_STATUS: { IN_USE: 1, IN_STORAGE: 2, MAINTENANCE: 3, RETIRED: 4 },
  OWNER_TYPE: { FACILITY: 1, RENTAL: 2 },
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { createAsset } from "@/lib/repositories/assets/createAsset";
import { updateAsset } from "@/lib/repositories/assets/updateAsset";
import { findExistsAssetCode } from "@/lib/repositories/assets/findExistsAssetCode";
import { insertStorage } from "@/storage/storage";

const mockRequireUser = requireUser as jest.Mock;
const mockCreateAsset = createAsset as jest.Mock;
const mockUpdateAsset = updateAsset as jest.Mock;
const mockFindExistsAssetCode = findExistsAssetCode as jest.Mock;
const mockInsertStorage = insertStorage as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

// FormDataをmockしてContent-Type問題を回避
const makeFormDataRequest = (url: string, fields: Record<string, string>) => {
  const req = new NextRequest(url, { method: "POST" });
  req.formData = async () => {
    const fd = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      fd.append(key, value);
    }
    return fd;
  };
  return req;
};

const validAssetFields = {
  assetCode: "ASSET-001",
  name: "車椅子A",
  categoryId: "1",
  storageId: "2",
  owner: "1",
  status: "1",
  notes: "",
  imageUrl: "",
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockFindExistsAssetCode.mockResolvedValue(null);
  mockCreateAsset.mockResolvedValue(undefined);
  mockUpdateAsset.mockResolvedValue(undefined);
  mockInsertStorage.mockResolvedValue("https://example.com/img.jpg");
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/asset/register/new
// ═══════════════════════════════════════════════════════════════════
describe("POST /api/asset/register/new", () => {
  describe("正常系", () => {
    it("資産登録に成功し200を返す", async () => {
      const res = await POSTNew(
        makeFormDataRequest("http://localhost/api/asset/register/new", validAssetFields)
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("介護用品を登録しました");
    });
  });

  describe("重複チェック", () => {
    it("資産コードが重複している場合400を返す", async () => {
      mockFindExistsAssetCode.mockResolvedValue({ id: 99 });

      const res = await POSTNew(
        makeFormDataRequest("http://localhost/api/asset/register/new", validAssetFields)
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POSTNew(
        makeFormDataRequest("http://localhost/api/asset/register/new", validAssetFields)
      );
      expect(res.status).toBe(401);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/asset/register/[id]
// ═══════════════════════════════════════════════════════════════════
describe("POST /api/asset/register/[id]", () => {
  const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

  describe("IDバリデーション", () => {
    it("IDが数値でない場合400を返す", async () => {
      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/asset/register/abc", validAssetFields),
        makeParams("abc")
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("INVALID_ARGUMENT");
    });

    it("IDが0の場合400を返す", async () => {
      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/asset/register/0", validAssetFields),
        makeParams("0")
      );
      expect(res.status).toBe(400);
    });
  });

  describe("重複チェック", () => {
    it("他の資産と資産コードが重複する場合400を返す", async () => {
      mockFindExistsAssetCode.mockResolvedValue({ id: 50 });

      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/asset/register/5", validAssetFields),
        makeParams("5")
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/asset/register/5", validAssetFields),
        makeParams("5")
      );
      expect(res.status).toBe(401);
    });
  });
});

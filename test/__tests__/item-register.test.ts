import { NextRequest } from "next/server";
import { POST as POSTNew } from "@/app/api/item/register/new/route";
import { POST as POSTUpdate } from "@/app/api/item/register/[id]/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/items/createItem", () => ({
  createItem: jest.fn(),
}));
jest.mock("@/lib/repositories/items/updateItem", () => ({
  updateItem: jest.fn(),
}));
jest.mock("@/lib/repositories/items/findExistsItemCode", () => ({
  findExistsItemCode: jest.fn(),
}));
jest.mock("@/storage/storage", () => ({
  insertStorage: jest.fn(),
  deleteStorage: jest.fn(),
}));
jest.mock("server-only", () => ({}));
jest.mock("@/db", () => ({ db: {} }));
jest.mock("@/db/index", () => ({ db: {} }));
jest.mock("@/auth", () => ({ auth: jest.fn() }));

import { requireUser } from "@/lib/services/auth/requireUser";
import { createItem } from "@/lib/repositories/items/createItem";
import { updateItem } from "@/lib/repositories/items/updateItem";
import { findExistsItemCode } from "@/lib/repositories/items/findExistsItemCode";

const mockRequireUser = requireUser as jest.Mock;
const mockCreateItem = createItem as jest.Mock;
const mockUpdateItem = updateItem as jest.Mock;
const mockFindExistsItemCode = findExistsItemCode as jest.Mock;

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

const validItemFields = {
  itemCode: "ITEM-001",
  name: "マスク",
  unit: "1",
  notes: "",
  imageUrl: "",
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockFindExistsItemCode.mockResolvedValue(null);
  mockCreateItem.mockResolvedValue(undefined);
  mockUpdateItem.mockResolvedValue({ id: 3 });
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/item/register/new
// ═══════════════════════════════════════════════════════════════════
describe("POST /api/item/register/new", () => {
  describe("正常系", () => {
    it("消耗品登録に成功し200を返す", async () => {
      const res = await POSTNew(
        makeFormDataRequest("http://localhost/api/item/register/new", validItemFields)
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("消耗品を登録しました");
    });
  });

  describe("重複チェック", () => {
    it("品目コードが重複している場合400を返す", async () => {
      mockFindExistsItemCode.mockResolvedValue({ id: 99 });

      const res = await POSTNew(
        makeFormDataRequest("http://localhost/api/item/register/new", validItemFields)
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
        makeFormDataRequest("http://localhost/api/item/register/new", validItemFields)
      );
      expect(res.status).toBe(401);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// POST /api/item/register/[id]
// ═══════════════════════════════════════════════════════════════════
describe("POST /api/item/register/[id]", () => {
  const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

  describe("IDバリデーション", () => {
    it("IDが数値でない場合400を返す", async () => {
      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/item/register/abc", validItemFields),
        makeParams("abc")
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("INVALID_ARGUMENT");
    });

    it("IDが0の場合400を返す", async () => {
      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/item/register/0", validItemFields),
        makeParams("0")
      );
      expect(res.status).toBe(400);
    });
  });

  describe("重複チェック", () => {
    it("他の消耗品と品目コードが重複する場合400を返す", async () => {
      mockFindExistsItemCode.mockResolvedValue({ id: 50 });

      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/item/register/3", validItemFields),
        makeParams("3")
      );
      const body = await res.json();

      expect(res.status).toBe(400);
    });
  });

  describe("存在しない場合", () => {
    it("対象が見つからない場合404を返す", async () => {
      mockUpdateItem.mockResolvedValue(null);

      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/item/register/3", validItemFields),
        makeParams("3")
      );
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.code).toBe("NOT_FOUND");
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POSTUpdate(
        makeFormDataRequest("http://localhost/api/item/register/3", validItemFields),
        makeParams("3")
      );
      expect(res.status).toBe(401);
    });
  });
});

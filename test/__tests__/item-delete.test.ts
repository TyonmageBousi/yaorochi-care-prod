import { NextRequest } from "next/server";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/storage/index", () => ({
  supabase: {},
  STORAGE_BUCKET: "test-bucket",
}));
jest.mock("@/storage/storage", () => ({
  deleteStorage: jest.fn(),
}));
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/items/findItemByFacilityAndId", () => ({
  findItemByFacilityAndId: jest.fn(),
}));
jest.mock("@/lib/repositories/items/softDeleteItemByFacilityAndId", () => ({
  softDeleteItemByFacilityAndId: jest.fn(),
}));
jest.mock("@/db", () => ({ db: {} }));
jest.mock("@/db/index", () => ({ db: {} }));
jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("server-only", () => ({}));

import { DELETE } from "@/app/api/item/delete/[id]/route";
import { requireUser } from "@/lib/services/auth/requireUser";
import { findItemByFacilityAndId } from "@/lib/repositories/items/findItemByFacilityAndId";
import { softDeleteItemByFacilityAndId } from "@/lib/repositories/items/softDeleteItemByFacilityAndId";
import { deleteStorage } from "@/storage/storage";

const mockRequireUser = requireUser as jest.Mock;
const mockFindItem = findItemByFacilityAndId as jest.Mock;
const mockSoftDelete = softDeleteItemByFacilityAndId as jest.Mock;
const mockDeleteStorage = deleteStorage as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };
const mockItem = { id: 5, name: "マスク", imageUrl: "https://example.com/img.jpg" };

const makeRequest = (id: string) =>
  new NextRequest(`http://localhost/api/item/delete/${id}`, { method: "DELETE" });

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockFindItem.mockResolvedValue(mockItem);
  mockSoftDelete.mockResolvedValue(true);
  mockDeleteStorage.mockResolvedValue(undefined);
});

describe("DELETE /api/item/delete/[id]", () => {
  describe("正常系", () => {
    it("削除に成功し200を返す", async () => {
      const res = await DELETE(makeRequest("5"), makeParams("5"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("消耗品を削除しました");
    });

    it("画像がある場合deleteStorageが呼ばれる", async () => {
      await DELETE(makeRequest("5"), makeParams("5"));

      expect(mockDeleteStorage).toHaveBeenCalledWith(mockItem.imageUrl);
    });

    it("画像がない場合deleteStorageは呼ばれない", async () => {
      mockFindItem.mockResolvedValue({ ...mockItem, imageUrl: null });

      await DELETE(makeRequest("5"), makeParams("5"));

      expect(mockDeleteStorage).not.toHaveBeenCalled();
    });

    it("deleteStorageが失敗しても削除自体は成功する", async () => {
      mockDeleteStorage.mockRejectedValue(new Error("Storage error"));

      const res = await DELETE(makeRequest("5"), makeParams("5"));

      expect(res.status).toBe(200);
    });
  });

  describe("バリデーションエラー", () => {
    it("IDが数値でない場合400を返す", async () => {
      const res = await DELETE(makeRequest("abc"), makeParams("abc"));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("INVALID_ARGUMENT");
    });

    it("IDが0の場合400を返す", async () => {
      const res = await DELETE(makeRequest("0"), makeParams("0"));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body).toMatchObject({
        success: false,
        code: expect.any(String),
        message: expect.any(String),
      });
    });

    it("IDが負の数の場合400を返す", async () => {
      const res = await DELETE(makeRequest("-1"), makeParams("-1"));

      expect(res.status).toBe(400);
    });
  });

  describe("存在しない場合", () => {
    it("消耗品が見つからない場合404を返す", async () => {
      mockFindItem.mockResolvedValue(null);

      const res = await DELETE(makeRequest("5"), makeParams("5"));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.code).toBe("NOT_FOUND");
    });

    it("softDeleteが失敗した場合404を返す", async () => {
      mockSoftDelete.mockResolvedValue(null);

      const res = await DELETE(makeRequest("5"), makeParams("5"));
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body).toMatchObject({
        success: false,
        code: "NOT_FOUND",
      });
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await DELETE(makeRequest("5"), makeParams("5"));

      expect(res.status).toBe(401);
    });
  });
});

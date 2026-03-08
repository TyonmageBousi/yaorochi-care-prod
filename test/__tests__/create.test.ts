import { NextRequest } from "next/server";
import { POST } from "@/app/api/stock-take/create/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/stockTakes/createStockTakeLine", () => ({
  createStockTakeLine: jest.fn(),
}));
jest.mock("@/lib/repositories/stockTakes/findExistStockTake", () => ({
  findExistStockTake: jest.fn(),
}));
jest.mock("@/lib/validations/stock-takes/stockTakes", () => ({
  stockTakeFormSchema: {
    safeParse: jest.fn(),
  },
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { createStockTakeLine } from "@/lib/repositories/stockTakes/createStockTakeLine";
import { findExistStockTake } from "@/lib/repositories/stockTakes/findExistStockTake";
import { stockTakeFormSchema } from "@/lib/validations/stock-takes/stockTakes";

const mockRequireUser = requireUser as jest.Mock;
const mockCreateStockTakeLine = createStockTakeLine as jest.Mock;
const mockFindExistStockTake = findExistStockTake as jest.Mock;
const mockSafeParse = stockTakeFormSchema.safeParse as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/stock-take/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockFindExistStockTake.mockResolvedValue(null);
  mockCreateStockTakeLine.mockResolvedValue(42);
  mockSafeParse.mockReturnValue({
    success: true,
    data: { storageId: "5", notes: "テスト備考" },
  });
});

describe("POST /api/stock-take/create", () => {
  describe("正常系", () => {
    it("棚卸作成に成功しstockTakeIdを返す", async () => {
      const res = await POST(makeRequest({ storageId: "5" }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.result.stockTakeId).toBe(42);
    });

    it("createStockTakeLineにfacilityIdとuserIdが渡される", async () => {
      await POST(makeRequest({ storageId: "5" }));

      expect(mockCreateStockTakeLine).toHaveBeenCalledWith(
        expect.objectContaining({
          facilityId: mockUser.facilityId,
          userId: mockUser.id,
          storageId: 5,
        })
      );
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POST(makeRequest({ storageId: "5" }));
      expect(res.status).toBe(401);
    });
  });

  describe("バリデーションエラー", () => {
    it("バリデーション失敗の場合400を返す", async () => {
      mockSafeParse.mockReturnValue({
        success: false,
        error: { issues: [{ path: ["storageId"], message: "保管場所を選択してください" }] },
      });

      const res = await POST(makeRequest({}));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });
  });

  describe("進行中の棚卸がある場合", () => {
    it("同じ保管場所に進行中の棚卸がある場合409を返す", async () => {
      mockFindExistStockTake.mockResolvedValue({ id: 10, storageId: 5 });

      const res = await POST(makeRequest({ storageId: "5" }));
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.code).toBe("DUPLICATE_IN_PROGRESS");
      expect(body.existStockTake).toBeDefined();
    });
  });
});

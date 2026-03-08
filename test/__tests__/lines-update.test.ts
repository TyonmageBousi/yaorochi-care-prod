import { NextRequest } from "next/server";
import { POST } from "@/app/api/stock-take/[id]/lines/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/stockTakes/updateStockTakeLines", () => ({
  updateStockTakeLines: jest.fn(),
}));
jest.mock("@/lib/validations/stock-takes/stockTakeCountSchema", () => ({
  stockTakeCountSchema: {
    safeParse: jest.fn(),
  },
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { updateStockTakeLines } from "@/lib/repositories/stockTakes/updateStockTakeLines";
import { stockTakeCountSchema } from "@/lib/validations/stock-takes/stockTakeCountSchema";

const mockRequireUser = requireUser as jest.Mock;
const mockUpdateStockTakeLines = updateStockTakeLines as jest.Mock;
const mockSafeParse = stockTakeCountSchema.safeParse as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown, id = "10") =>
  new NextRequest(`http://localhost/api/stock-take/${id}/lines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockUpdateStockTakeLines.mockResolvedValue(undefined);
  mockSafeParse.mockReturnValue({
    success: true,
    data: { lines: [{ itemId: 1, countedQty: 5 }] },
  });
});

describe("POST /api/stock-take/[id]/lines", () => {
  describe("正常系", () => {
    it("棚卸明細の保存に成功し200を返す", async () => {
      const res = await POST(makeRequest({ lines: [] }, "10"), makeParams("10"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.result.stockTakeId).toBe(10);
    });

    it("updateStockTakeLinesにstockTakeIdとfacilityIdが渡される", async () => {
      await POST(makeRequest({ lines: [] }, "10"), makeParams("10"));

      expect(mockUpdateStockTakeLines).toHaveBeenCalledWith(
        expect.objectContaining({ stockTakeId: 10, facilityId: mockUser.facilityId })
      );
    });
  });

  describe("IDバリデーション", () => {
    it("IDが数値でない場合400を返す", async () => {
      const res = await POST(makeRequest({ lines: [] }, "abc"), makeParams("abc"));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("NOT_FOUND");
    });
  });

  describe("バリデーションエラー", () => {
    it("バリデーション失敗の場合400を返す", async () => {
      mockSafeParse.mockReturnValue({
        success: false,
        error: { issues: [{ path: ["lines"], message: "明細が必要です" }] },
      });

      const res = await POST(makeRequest({}), makeParams("10"));
      expect(res.status).toBe(400);
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POST(makeRequest({ lines: [] }, "10"), makeParams("10"));
      expect(res.status).toBe(401);
    });
  });
});

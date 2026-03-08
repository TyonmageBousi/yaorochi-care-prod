import { NextRequest } from "next/server";
import { POST } from "@/app/api/stock-take/[id]/post/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/stockTakes/confirmStockTake", () => ({
  confirmStockTake: jest.fn(),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { confirmStockTake } from "@/lib/repositories/stockTakes/confirmStockTake";

const mockRequireUser = requireUser as jest.Mock;
const mockConfirmStockTake = confirmStockTake as jest.Mock;

const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (id: string) =>
  new NextRequest(`http://localhost/api/stock-take/${id}/post`, { method: "POST" });

const makeParams = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockConfirmStockTake.mockResolvedValue(undefined);
});

describe("POST /api/stock-take/[id]/post", () => {
  describe("正常系", () => {
    it("棚卸確定に成功し200を返す", async () => {
      const res = await POST(makeRequest("10"), makeParams("10"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("棚卸を確定しました");
    });

    it("confirmStockTakeにstockTakeIdとfacilityIdが渡される", async () => {
      await POST(makeRequest("10"), makeParams("10"));

      expect(mockConfirmStockTake).toHaveBeenCalledWith(10, mockUser.facilityId);
    });
  });

  describe("IDバリデーション", () => {
    it("IDが数値でない場合400を返す", async () => {
      const res = await POST(makeRequest("abc"), makeParams("abc"));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("NOT_FOUND");
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POST(makeRequest("10"), makeParams("10"));
      expect(res.status).toBe(401);
    });
  });
});

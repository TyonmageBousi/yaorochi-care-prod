import { NextRequest } from "next/server";
import { DELETE } from "@/app/api/stock-take/[id]/lines/[lineId]/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/db", () => ({
  db: {
    transaction: jest.fn(),
  },
}));
jest.mock("@/db/schema", () => ({
  stockTakeLines: { id: "id", stockTakeId: "stockTakeId" },
  stockTakes: { id: "id", facilityId: "facilityId" },
}));
jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a, b) => ({ type: "eq", a, b })),
  and: jest.fn((...args) => ({ type: "and", args })),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { db } from "@/db";

const mockRequireUser = requireUser as jest.Mock;
const mockDb = db as jest.Mocked<typeof db>;

const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (id: string, lineId: string) =>
  new NextRequest(`http://localhost/api/stock-take/${id}/lines/${lineId}`, { method: "DELETE" });

const makeParams = (id: string, lineId: string) =>
  ({ params: Promise.resolve({ id, lineId }) });

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);

  // transaction mock: success
  (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
    const tx = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 10 }]),
        }),
      }),
      delete: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 1 }]),
        }),
      }),
    };
    return cb(tx);
  });
});

describe("DELETE /api/stock-take/[id]/lines/[lineId]", () => {
  describe("正常系", () => {
    it("明細削除に成功し200を返す", async () => {
      const res = await DELETE(makeRequest("10", "1"), makeParams("10", "1"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("削除しました");
    });
  });

  describe("IDバリデーション", () => {
    it("stockTakeIdが数値でない場合400を返す", async () => {
      const res = await DELETE(makeRequest("abc", "1"), makeParams("abc", "1"));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("INVALID_ARGUMENT");
    });

    it("lineIdが数値でない場合400を返す", async () => {
      const res = await DELETE(makeRequest("10", "abc"), makeParams("10", "abc"));
      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body).toMatchObject({
        success: false,
        code: "INVALID_ARGUMENT",
      });
    });
  });

  describe("存在チェック", () => {
    it("棚卸セッションが見つからない場合404を返す", async () => {
      (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
        const tx = {
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([]), // セッションなし
            }),
          }),
          delete: jest.fn(),
        };
        return cb(tx);
      });

      const res = await DELETE(makeRequest("10", "1"), makeParams("10", "1"));
      const body = await res.json();
      expect(res.status).toBe(404);
      expect(body).toMatchObject({
        success: false,
        code: "NOT_FOUND",
        message: expect.any(String),
      });
    });

    it("対象の明細が見つからない場合404を返す", async () => {
      (mockDb.transaction as jest.Mock).mockImplementation(async (cb) => {
        const tx = {
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([{ id: 10 }]),
            }),
          }),
          delete: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([]), // 明細なし
            }),
          }),
        };
        return cb(tx);
      });

      const res = await DELETE(makeRequest("10", "99"), makeParams("10", "99"));
      expect(res.status).toBe(404);
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await DELETE(makeRequest("10", "1"), makeParams("10", "1"));
      expect(res.status).toBe(401);
    });
  });
});

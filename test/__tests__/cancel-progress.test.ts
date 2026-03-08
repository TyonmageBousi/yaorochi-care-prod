import { NextRequest } from "next/server";
import { POST } from "@/app/api/stock-take/cancel-progress/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/db/index", () => ({
  db: {
    update: jest.fn(),
  },
}));
jest.mock("@/db/schema", () => ({
  stockTakes: { id: "id", facilityId: "facilityId", status: "status", updatedAt: "updatedAt" },
  STOCKTAKE_STATUS: {
    IN_PROGRESS: "in_progress",
    CANCELED: "canceled",
    COMPLETED: "completed",
  },
}));
jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a, b) => ({ type: "eq", a, b })),
  and: jest.fn((...args) => ({ type: "and", args })),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { db } from "@/db/index";

const mockRequireUser = requireUser as jest.Mock;
const mockDb = db as jest.Mocked<typeof db>;

const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/stock-take/cancel-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const setupDbUpdateMock = (returning: unknown[]) => {
  (mockDb.update as jest.Mock).mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockReturnValue({
          execute: jest.fn().mockResolvedValue(returning),
        }),
      }),
    }),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  setupDbUpdateMock([{ id: 5 }]);
});

describe("POST /api/stock-take/cancel-progress", () => {
  describe("正常系", () => {
    it("棚卸キャンセルに成功し200を返す", async () => {
      const res = await POST(makeRequest({ stockTakeId: 5 }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toBe("棚卸をキャンセルしました");
    });
  });

  describe("バリデーションエラー", () => {
    it("stockTakeIdが数値でない場合400を返す", async () => {
      const res = await POST(makeRequest({ stockTakeId: "abc" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("INVALID_ARGUMENT");
    });

    it("stockTakeIdが0以下の場合400を返す", async () => {
      const res = await POST(makeRequest({ stockTakeId: 0 }));
      expect(res.status).toBe(400);
    });
  });

  describe("対象が見つからない場合", () => {
    it("更新対象がない場合404を返す", async () => {
      setupDbUpdateMock([]);

      const res = await POST(makeRequest({ stockTakeId: 999 }));
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

      const res = await POST(makeRequest({ stockTakeId: 5 }));
      expect(res.status).toBe(401);
    });
  });
});

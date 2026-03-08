import { NextRequest } from "next/server";
import { POST } from "@/app/api/inbound/register/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/services/inBoundApi/inBoundService", () => ({
  processInbound: jest.fn(),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { processInbound } from "@/lib/services/inBoundApi/inBoundService";

const mockRequireUser = requireUser as jest.Mock;
const mockProcessInbound = processInbound as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/inbound/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  rows: [{ itemId: 1, storageId: 2, qty: 5 }],
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockProcessInbound.mockResolvedValue(1);
});

describe("POST /api/inbound/register", () => {
  describe("正常系", () => {
    it("入庫に成功し201を返す", async () => {
      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message).toBe("入庫を記録しました");
    });

    it("processInboundにfacilityIdとuserIdが渡される", async () => {
      await POST(makeRequest(validBody));

      expect(mockProcessInbound).toHaveBeenCalledWith(
        expect.objectContaining({ rows: expect.any(Array) }),
        mockUser.facilityId,
        mockUser.id
      );
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POST(makeRequest(validBody));
      const body = await res.json();
      expect(res.status).toBe(401);
      expect(body).toMatchObject({
        success: false,
        code: "UNAUTHORIZED",
        message: expect.any(String),
      });
    });
  });

  describe("バリデーションエラー", () => {
    it("rowsが空配列の場合400を返す", async () => {
      const res = await POST(makeRequest({ rows: [] }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.code).toBe("VALIDATION");
      expect(body.details).toBeDefined();
      expect(typeof body.details).toBe("object");

      const details = body.details as Record<string, string[]>;
      Object.values(details).forEach((messages) => {
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBeGreaterThan(0);
        expect(typeof messages[0]).toBe("string");
      });
    });

    it("qtyが0以下の場合400を返す", async () => {
      const res = await POST(makeRequest({ rows: [{ itemId: 1, storageId: 2, qty: 0 }] }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("itemIdが欠落している場合400を返す", async () => {
      const res = await POST(makeRequest({ rows: [{ storageId: 2, qty: 5 }] }));
      const body = await res.json();

      expect(res.status).toBe(400);
    });

    it("rowsがない場合400を返す", async () => {
      const res = await POST(makeRequest({}));
      const body = await res.json();

      expect(res.status).toBe(400);
    });
  });

  describe("ビジネスロジックエラー", () => {
    it("processInboundがBusinessValidationErrorをthrowした場合422を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockProcessInbound.mockRejectedValue(
        new BusinessValidationError("入力内容を確認してください", 422, "VALIDATION_ERROR", {
          "rows.0.itemId": ["該当の商品が見つかりません"],
        })
      );

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.details["rows.0.itemId"]).toBeDefined();
      expect(res.status).toBe(422);
      expect(body).toMatchObject({
        success: false,
        code: "VALIDATION_ERROR",
        message: expect.any(String),
        details: {
          "rows.0.itemId": expect.arrayContaining([expect.any(String)]),
        },
      });
    });
  });
});

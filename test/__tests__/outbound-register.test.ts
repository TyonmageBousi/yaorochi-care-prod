import { NextRequest } from "next/server";
import { POST } from "@/app/api/outbound/register/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/services/outBoundApi/outBoundService", () => ({
  processOutbound: jest.fn(),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { processOutbound } from "@/lib/services/outBoundApi/outBoundService";

const mockRequireUser = requireUser as jest.Mock;
const mockProcessOutbound = processOutbound as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/outbound/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  roomId: "1",
  rows: [{ itemId: 1, storageId: "2", qty: 5 }],
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockProcessOutbound.mockResolvedValue(undefined);
});

describe("POST /api/outbound/register", () => {
  describe("正常系", () => {
    it("払出に成功し201を返す", async () => {
      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message).toBe("払出を記録しました");
    });

    it("processOutboundにfacilityIdとuserIdが渡される", async () => {
      await POST(makeRequest(validBody));

      expect(mockProcessOutbound).toHaveBeenCalledWith(
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
      const res = await POST(makeRequest({ roomId: "1", rows: [] }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.code).toBe("VALIDATION");
      expect(body.details).toBeDefined();
    });

    it("rowsがない場合400を返す", async () => {
      const res = await POST(makeRequest({ roomId: "1" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("qtyが0以下の場合400を返す", async () => {
      const res = await POST(makeRequest({
        roomId: "1",
        rows: [{ itemId: 1, storageId: "2", qty: 0 }],
      }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("roomIdが欠落している場合400を返す", async () => {
      const res = await POST(makeRequest({ rows: [{ itemId: 1, storageId: "2", qty: 3 }] }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("itemIdが欠落している場合400を返す", async () => {
      const res = await POST(makeRequest({
        roomId: "1",
        rows: [{ storageId: "2", qty: 3 }],
      }));
      const body = await res.json();

      expect(res.status).toBe(400);
    });
  });

  describe("ビジネスロジックエラー", () => {
    it("部屋番号が存在しない場合processOutboundが422をthrowしAPIも422を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockProcessOutbound.mockRejectedValue(
        new BusinessValidationError("入力内容を確認してください", 422, "VALIDATION_ERROR", {
          roomId: ["部屋番号が見つかりません"],
        })
      );

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body).toMatchObject({
        success: false,
        code: "VALIDATION_ERROR",
        message: expect.any(String),
        details: {
          roomId: expect.arrayContaining([expect.any(String)]),
        },
      });
    });

    it("在庫不足の場合processOutboundが422をthrowしAPIも422を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockProcessOutbound.mockRejectedValue(
        new BusinessValidationError("在庫が不足しています", 422, "VALIDATION_ERROR", {
          "rows.0.qty": ["在庫が不足しています（必要: 10、在庫: 3）"],
        })
      );

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.details["rows.0.qty"]).toBeDefined();
    });

    it("物品マスタが存在しない場合processOutboundが422をthrowしAPIも422を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockProcessOutbound.mockRejectedValue(
        new BusinessValidationError("入力内容を確認してください", 422, "VALIDATION_ERROR", {
          "rows.0.itemId": ["物品が見つかりません（商品マスタから削除された可能性があります）"],
        })
      );

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(422);
      expect(body.details["rows.0.itemId"]).toBeDefined();
    });
  });
});

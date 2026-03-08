import { NextRequest } from "next/server";
import { POST } from "@/app/api/room-number/register/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/roomNumbers/insertRoomNumber", () => ({
  insertRoomNumber: jest.fn(),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { insertRoomNumber } from "@/lib/repositories/roomNumbers/insertRoomNumber";

const mockRequireUser = requireUser as jest.Mock;
const mockInsertRoomNumber = insertRoomNumber as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/room-number/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = { label: "101号室" };

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockInsertRoomNumber.mockResolvedValue({ id: 1, label: "101号室" });
});

describe("POST /api/room-number/register", () => {
  describe("正常系", () => {
    it("部屋番号登録に成功し201を返す", async () => {
      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message).toBe("部屋番号を登録しました");
    });

    it("insertRoomNumberにfacilityIdとバリデーション済みデータが渡される", async () => {
      await POST(makeRequest(validBody));

      expect(mockInsertRoomNumber).toHaveBeenCalledWith(
        mockUser.facilityId,
        expect.objectContaining({ label: "101号室" })
      );
    });

    it("備考ありでも201を返す", async () => {
      const res = await POST(makeRequest({ label: "202号室", notes: "角部屋" }));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
    });
  });

  describe("重複エラー", () => {
    it("同じ部屋番号が既に存在する場合409を返す", async () => {
      mockInsertRoomNumber.mockResolvedValue(null);

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.code).toBe("ALREADY_EXISTS");
      expect(body.message).toBe("同じ部屋番号が既に存在しています");
    });
  });

  describe("バリデーションエラー", () => {
    it("labelが空文字の場合400を返す", async () => {
      const res = await POST(makeRequest({ label: "" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.code).toBe("VALIDATION");
      expect(body.details).toBeDefined();
    });

    it("labelがない場合400を返す", async () => {
      const res = await POST(makeRequest({}));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("labelが50文字超の場合400を返す", async () => {
      const res = await POST(makeRequest({ label: "あ".repeat(51) }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("labelに改行が含まれる場合400を返す", async () => {
      const res = await POST(makeRequest({ label: "101\n号室" }));
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

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body).toMatchObject({
        success: false,
        code: "UNAUTHORIZED",
      });
    });
  });
});

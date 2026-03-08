import { NextRequest } from "next/server";
import { POST } from "@/app/api/resident-register/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/roomNumbers/insertResidentName", () => ({
  selectExistingRoomIds: jest.fn(),
  insertResidentName: jest.fn(),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { selectExistingRoomIds, insertResidentName } from "@/lib/repositories/roomNumbers/insertResidentName";

const mockRequireUser = requireUser as jest.Mock;
const mockSelectExistingRoomIds = selectExistingRoomIds as jest.Mock;
const mockInsertResidentName = insertResidentName as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/resident-register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  rows: [
    { roomId: 1, residentName: "山田花子" },
    { roomId: 2, residentName: "佐藤一郎" },
  ],
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockSelectExistingRoomIds.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  mockInsertResidentName.mockResolvedValue(undefined);
});

describe("POST /api/resident-register", () => {
  describe("正常系", () => {
    it("入居者登録に成功し200を返す", async () => {
      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain("2件");
    });

    it("1件でも登録できる", async () => {
      mockSelectExistingRoomIds.mockResolvedValue([{ id: 1 }]);
      const res = await POST(makeRequest({ rows: [{ roomId: 1, residentName: "山田花子" }] }));
      expect(res.status).toBe(200);
    });
  });

  describe("認証エラー", () => {
    it("未認証の場合401を返す", async () => {
      const { BusinessValidationError } = await import("@/types/handleApiErrorType");
      mockRequireUser.mockRejectedValue(
        new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED")
      );

      const res = await POST(makeRequest(validBody));
      expect(res.status).toBe(401);
    });
  });

  describe("バリデーションエラー", () => {
    it("rowsが空の場合400を返す", async () => {
      const res = await POST(makeRequest({ rows: [] }));
      const body = await res.json();

      expect(res.status).toBe(400);
    });

    it("roomIdが欠落している場合400を返す", async () => {
      const res = await POST(makeRequest({ rows: [{ residentName: "山田花子" }] }));
      expect(res.status).toBe(400);
    });
  });

  describe("部屋の存在チェック", () => {
    it("存在しない部屋IDがある場合400を返す", async () => {
      mockSelectExistingRoomIds.mockResolvedValue([{ id: 1 }]); // roomId:2 が存在しない

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
      expect(body.details["rows.1.roomId"]).toBeDefined();
    });
  });
});

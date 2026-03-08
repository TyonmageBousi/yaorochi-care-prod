import { NextRequest } from "next/server";
import { POST } from "@/app/api/staff/register/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/db/index", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));
jest.mock("@/db/schema", () => ({
  users: { userId: "userId" },
  ROLE: { ADMIN: 1, MANAGER: 2, STAFF: 3 },
}));
jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a, b) => ({ type: "eq", a, b })),
}));
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { db } from "@/db/index";

const mockRequireUser = requireUser as jest.Mock;
const mockDb = db as jest.Mocked<typeof db>;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "管理者", userId: "admin01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/staff/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  userId: "staff01",
  name: "田中太郎",
  password: "Password1",
  passwordConfirm: "Password1",
  phone: "090-1234-5678",
  role: "3",
  hireDate: "2024-04-01",
};

const setupDbMock = (isUserIdTaken: boolean) => {
  (mockDb.select as jest.Mock).mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          then: jest.fn((cb) => Promise.resolve(cb(isUserIdTaken ? [{ id: 99 }] : []))),
        }),
      }),
    }),
  });
  (mockDb.insert as jest.Mock).mockReturnValue({
    values: jest.fn().mockResolvedValue(undefined),
  });
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  setupDbMock(false);
});

describe("POST /api/staff/register", () => {
  describe("正常系", () => {
    it("スタッフ登録に成功し201を返す", async () => {
      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.message).toBe("スタッフを登録しました");
    });

    it("db.insertが呼ばれfacilityIdが含まれる", async () => {
      await POST(makeRequest(validBody));

      expect(mockDb.insert).toHaveBeenCalled();
      const insertMock = mockDb.insert as jest.Mock;
      const valuesMock = insertMock.mock.results[0].value.values as jest.Mock;
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({ facilityId: mockUser.facilityId })
      );
    });
  });

  describe("重複エラー", () => {
    it("スタッフIDが既に使用されている場合409を返す", async () => {
      setupDbMock(true);

      const res = await POST(makeRequest(validBody));
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.success).toBe(false);
      expect(body.code).toBe("ALREADY_EXISTS");
      expect(body.message).toBe("このスタッフIDは既に使用されています");
    });
  });

  describe("バリデーションエラー", () => {
    it("userIdが空の場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, userId: "" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
      expect(body.details).toBeDefined();
    });

    it("パスワードが8文字未満の場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, password: "Pass1", passwordConfirm: "Pass1" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("パスワードに大文字がない場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, password: "password1", passwordConfirm: "password1" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("パスワードに数字がない場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, password: "Password", passwordConfirm: "Password" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("パスワードと確認用パスワードが一致しない場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, passwordConfirm: "Password2" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("userIdに使用不可文字が含まれる場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, userId: "スタッフ01" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("電話番号の桁数が不正な場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, phone: "090-123" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("hireDateのフォーマットが不正な場合400を返す", async () => {
      const res = await POST(makeRequest({ ...validBody, hireDate: "2024/04/01" }));
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

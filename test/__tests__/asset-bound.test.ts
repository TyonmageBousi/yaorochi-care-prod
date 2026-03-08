import { POST } from "@/app/api/asset-bound/route";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/services/auth/requireUser", () => ({
  requireUser: jest.fn(),
}));
jest.mock("@/lib/repositories/assets/createAssetEvent", () => ({
  createAssetEvent: jest.fn(),
}));
jest.mock("@/db/schema", () => ({
  ASSET_EVENT_TYPE: {
    MOVE: 1,
    ASSIGN_ROOM: 2,
    UNASSIGN_ROOM: 3,
    MAINTENANCE: 4,
    REPAIR: 5,
    RETIRE: 6,
  },
}));

import { requireUser } from "@/lib/services/auth/requireUser";
import { createAssetEvent } from "@/lib/repositories/assets/createAssetEvent";

const mockRequireUser = requireUser as jest.Mock;
const mockCreateAssetEvent = createAssetEvent as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const mockUser = { id: 1, name: "テストユーザー", userId: "test01", role: 1, facilityId: 10 };

const makeRequest = (body: unknown) =>
  new Request("http://localhost/api/asset-bound", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validMoveBody = {
  assetId: 1,
  eventType: 1, // MOVE
  toStorageId: "5",
};

const validAssignBody = {
  assetId: 1,
  eventType: 2, // ASSIGN_ROOM
  toRoomNumberId: "3",
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  mockRequireUser.mockResolvedValue(mockUser);
  mockCreateAssetEvent.mockResolvedValue({ id: 100 });
});

describe("POST /api/asset-bound", () => {
  describe("正常系", () => {
    it("移動イベントが成功し201を返す", async () => {
      const res = await POST(makeRequest(validMoveBody));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
    });

    it("居室割り当てイベントが成功し201を返す", async () => {
      const res = await POST(makeRequest(validAssignBody));
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
    });

    it("createAssetEventにfacilityIdとuserIdが渡される", async () => {
      await POST(makeRequest(validMoveBody));

      expect(mockCreateAssetEvent).toHaveBeenCalledWith(
        expect.any(Object),
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

      const res = await POST(makeRequest(validMoveBody));
      expect(res.status).toBe(401);
    });
  });

  describe("バリデーションエラー", () => {
    it("assetIdが欠落している場合400を返す", async () => {
      const res = await POST(makeRequest({ eventType: 1, toStorageId: "5" }));
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.code).toBe("VALIDATION");
    });

    it("不正なeventTypeの場合400を返す", async () => {
      const res = await POST(makeRequest({ assetId: 1, eventType: 999, toStorageId: "5" }));
      const body = await res.json();

      expect(res.status).toBe(400);
    });

    it("MOVE時にtoStorageIdがない場合400を返す", async () => {
      const res = await POST(makeRequest({ assetId: 1, eventType: 1 }));
      const body = await res.json();

      expect(res.status).toBe(400);
    });

    it("ASSIGN_ROOM時にtoRoomNumberIdがない場合400を返す", async () => {
      const res = await POST(makeRequest({ assetId: 1, eventType: 2 }));
      const body = await res.json();

      expect(res.status).toBe(400);
    });

    it("toStorageIdとtoRoomNumberIdが同時にある場合400を返す", async () => {
      const res = await POST(makeRequest({
        assetId: 1,
        eventType: 1,
        toStorageId: "5",
        toRoomNumberId: "3",
      }));
      const body = await res.json();

      expect(res.status).toBe(400);
    });
  });
});

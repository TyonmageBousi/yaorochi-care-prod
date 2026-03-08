// イベントタイプ → 資産ステータス変換のテスト
// DBもモックも不要な純粋関数

jest.mock("@/db/schema", () => ({
  ASSET_EVENT_TYPE: {
    CREATE: 1,
    MOVE: 2,
    ASSIGN_ROOM: 3,
    UNASSIGN_ROOM: 4,
    MAINTENANCE: 5,
    REPAIR: 6,
    RETIRE: 7,
  },
  ASSET_STATUS: {
    IN_USE: 1,
    IN_STORAGE: 2,
    MAINTENANCE: 3,
    RETIRED: 4,
  },
}));

import { updateAssetService } from "@/lib/services/assetBoundApi/updateAssetService";
import { ASSET_EVENT_TYPE, ASSET_STATUS } from "@/db/schema";

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("updateAssetService", () => {

  describe("MOVE（移動）", () => {
    it("ステータスがIN_STORAGEになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.MOVE,
        toStorageId: 5,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.status).toBe(ASSET_STATUS.IN_STORAGE);
    });

    it("currentStorageIdがtoStorageIdになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.MOVE,
        toStorageId: 5,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.currentStorageId).toBe(5);
    });

    it("roomNumberIdがnullになる（居室から移動）", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.MOVE,
        toStorageId: 5,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.roomNumberId).toBeNull();
    });
  });

  describe("ASSIGN_ROOM（居室割り当て）", () => {
    it("ステータスがIN_USEになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.ASSIGN_ROOM,
        toStorageId: undefined,
        toRoomNumberId: 3,
        notes: undefined,
      });
      expect(result.status).toBe(ASSET_STATUS.IN_USE);
    });

    it("roomNumberIdがtoRoomNumberIdになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.ASSIGN_ROOM,
        toStorageId: undefined,
        toRoomNumberId: 3,
        notes: undefined,
      });
      expect(result.roomNumberId).toBe(3);
    });
  });

  describe("UNASSIGN_ROOM（居室解除）", () => {
    it("ステータスがIN_STORAGEになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.UNASSIGN_ROOM,
        toStorageId: 7,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.status).toBe(ASSET_STATUS.IN_STORAGE);
    });

    it("currentStorageIdがtoStorageIdになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.UNASSIGN_ROOM,
        toStorageId: 7,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.currentStorageId).toBe(7);
    });

    it("roomNumberIdがnullになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.UNASSIGN_ROOM,
        toStorageId: 7,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.roomNumberId).toBeNull();
    });
  });

  describe("MAINTENANCE（メンテナンス）", () => {
    it("ステータスがMAINTENANCEになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.MAINTENANCE,
        toStorageId: undefined,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.status).toBe(ASSET_STATUS.MAINTENANCE);
    });

    it("storageIdやroomNumberIdは変更されない", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.MAINTENANCE,
        toStorageId: undefined,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect((result as any).currentStorageId).toBeUndefined();
      expect((result as any).roomNumberId).toBeUndefined();
    });
  });

  describe("REPAIR（修理）", () => {
    it("ステータスがMAINTENANCEになる（修理もメンテ扱い）", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.REPAIR,
        toStorageId: undefined,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.status).toBe(ASSET_STATUS.MAINTENANCE);
    });
  });

  describe("RETIRE（廃棄）", () => {
    it("ステータスがRETIREDになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.RETIRE,
        toStorageId: undefined,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.status).toBe(ASSET_STATUS.RETIRED);
    });

    it("roomNumberIdがnullになる", async () => {
      const result = await updateAssetService({
        assetId: 1,
        eventType: ASSET_EVENT_TYPE.RETIRE,
        toStorageId: undefined,
        toRoomNumberId: undefined,
        notes: undefined,
      });
      expect(result.roomNumberId).toBeNull();
    });
  });

  describe("不正なeventType", () => {
    it("未知のeventTypeはErrorをthrowする", async () => {
      await expect(
        updateAssetService({ assetId: 1, eventType: 999 as any, toStorageId: undefined, toRoomNumberId: undefined, notes: undefined })
      ).rejects.toThrow("Unknown eventType: 999");
    });
  });
});
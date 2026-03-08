// assetEventFormSchema の複雑なクロスフィールドバリデーションのテスト

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
}));

import { assetEventFormSchema, assetEventRequestSchema } from "@/lib/validations/assetEventSchema";
import { ASSET_EVENT_TYPE } from "@/db/schema";

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const getErrors = (data: unknown) => {
  const result = assetEventFormSchema.safeParse(data);
  if (result.success) return null;
  const map: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    map[key] = [...(map[key] ?? []), issue.message];
  }
  return map;
};

// ─── MOVE ─────────────────────────────────────────────────────────────────────
describe("MOVE（移動）", () => {
  it("toStorageIdがあれば成功する", () => {
    const result = assetEventFormSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.MOVE, toStorageId: "5",
    });
    expect(result.success).toBe(true);
  });

  it("toStorageIdがない場合エラー", () => {
    const errors = getErrors({ assetId: 1, eventType: ASSET_EVENT_TYPE.MOVE });
    expect(errors?.toStorageId).toContain("保管場所を選択してください");
  });

  it("toStorageIdが空文字の場合エラー", () => {
    const errors = getErrors({ assetId: 1, eventType: ASSET_EVENT_TYPE.MOVE, toStorageId: "" });
    expect(errors?.toStorageId).toContain("保管場所を選択してください");
  });

  it("toStorageIdが不正な文字列の場合エラー", () => {
    const errors = getErrors({ assetId: 1, eventType: ASSET_EVENT_TYPE.MOVE, toStorageId: "abc" });
    expect(errors?.toStorageId).toContain("保管場所が不正です。");
  });

  it("toStorageIdが0の場合エラー（正の整数のみ）", () => {
    const errors = getErrors({ assetId: 1, eventType: ASSET_EVENT_TYPE.MOVE, toStorageId: "0" });
    expect(errors?.toStorageId).toBeDefined();
  });
});

// ─── ASSIGN_ROOM ──────────────────────────────────────────────────────────────
describe("ASSIGN_ROOM（居室割り当て）", () => {
  it("toRoomNumberIdがあれば成功する", () => {
    const result = assetEventFormSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.ASSIGN_ROOM, toRoomNumberId: "3",
    });
    expect(result.success).toBe(true);
  });

  it("toRoomNumberIdがない場合エラー", () => {
    const errors = getErrors({ assetId: 1, eventType: ASSET_EVENT_TYPE.ASSIGN_ROOM });
    expect(errors?.toRoomNumberId).toContain("居室を選択してください");
  });

  it("toRoomNumberIdが不正な文字列の場合エラー", () => {
    const errors = getErrors({
      assetId: 1, eventType: ASSET_EVENT_TYPE.ASSIGN_ROOM, toRoomNumberId: "abc",
    });
    expect(errors?.toRoomNumberId).toContain("居室IDが不正です。");
  });
});

// ─── UNASSIGN_ROOM ────────────────────────────────────────────────────────────
describe("UNASSIGN_ROOM（居室解除）", () => {
  it("toStorageIdがあれば成功する", () => {
    const result = assetEventFormSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.UNASSIGN_ROOM, toStorageId: "7",
    });
    expect(result.success).toBe(true);
  });

  it("toStorageIdがない場合エラー", () => {
    const errors = getErrors({ assetId: 1, eventType: ASSET_EVENT_TYPE.UNASSIGN_ROOM });
    expect(errors?.toStorageId).toContain("保管場所を選択してください");
  });
});

// ─── MAINTENANCE / REPAIR ─────────────────────────────────────────────────────
describe("MAINTENANCE / REPAIR（メンテ・修理）", () => {
  it("MEINTENANCEはtoStorageId/toRoomNumberId不要で成功する", () => {
    const result = assetEventFormSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.MAINTENANCE,
    });
    expect(result.success).toBe(true);
  });

  it("REPAIRはtoStorageId/toRoomNumberId不要で成功する", () => {
    const result = assetEventFormSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.REPAIR,
    });
    expect(result.success).toBe(true);
  });
});

// ─── RETIRE ───────────────────────────────────────────────────────────────────
describe("RETIRE（廃棄）", () => {
  it("何も追加指定なしで成功する", () => {
    const result = assetEventFormSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.RETIRE,
    });
    expect(result.success).toBe(true);
  });
});

// ─── 同時指定NG ───────────────────────────────────────────────────────────────
describe("toStorageId と toRoomNumberId の同時指定", () => {
  it("両方あるとエラーになる", () => {
    const errors = getErrors({
      assetId: 1,
      eventType: ASSET_EVENT_TYPE.MOVE,
      toStorageId: "5",
      toRoomNumberId: "3",
    });
    expect(errors?.toStorageId).toContain("保管場所と居室は同時に指定できません");
    expect(errors?.toRoomNumberId).toContain("保管場所と居室は同時に指定できません");
  });
});

// ─── assetId バリデーション ────────────────────────────────────────────────────
describe("assetId バリデーション", () => {
  it("assetIdが0以下の場合エラー", () => {
    const errors = getErrors({
      assetId: 0, eventType: ASSET_EVENT_TYPE.MAINTENANCE,
    });
    expect(errors?.assetId).toBeDefined();
  });

  it("assetIdがない場合エラー", () => {
    const errors = getErrors({ eventType: ASSET_EVENT_TYPE.MAINTENANCE });
    expect(errors?.assetId).toBeDefined();
  });
});

// ─── assetEventRequestSchema（変換テスト）──────────────────────────────────────
describe("assetEventRequestSchema（文字列ID → 数値変換）", () => {
  it("toStorageIdが文字列から数値に変換される", () => {
    const result = assetEventRequestSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.MOVE, toStorageId: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.toStorageId).toBe(5);
  });

  it("toRoomNumberIdが文字列から数値に変換される", () => {
    const result = assetEventRequestSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.ASSIGN_ROOM, toRoomNumberId: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.toRoomNumberId).toBe(3);
  });

  it("notesの前後空白がtrimされる", () => {
    const result = assetEventRequestSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.RETIRE, notes: "  メモ  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.notes).toBe("メモ");
  });

  it("notesが空白のみのとき undefinedになる", () => {
    const result = assetEventRequestSchema.safeParse({
      assetId: 1, eventType: ASSET_EVENT_TYPE.RETIRE, notes: "   ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.notes).toBeUndefined();
  });
});

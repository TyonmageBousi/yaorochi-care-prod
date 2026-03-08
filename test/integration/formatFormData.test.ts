// DBの値 → フォームのデフォルト値へのマッピングテスト

jest.mock("server-only", () => ({}));
jest.mock("@/db/schema", () => ({
  ASSET_STATUS: { IN_USE: 1, IN_STORAGE: 2, MAINTENANCE: 3, RETIRED: 4 },
  OWNER_TYPE: { FACILITY: 1, RENTAL: 2 },
}));
jest.mock("@/lib/validations/asset", () => ({
  OWNER_TYPE_STR: { FACILITY: "1", RENTAL: "2" },
  ASSET_STATUS_STR: { IN_USE: "1", IN_STORAGE: "2", MAINTENANCE: "3", RETIRED: "4" },
}));

import {
  ownerToStr,
  statusToStr,
  mapAssetToFormDefaultValues,
  mapItemToFormDefaultValues,
} from "@/lib/services/common/formatFormData";

// ─── ownerToStr ───────────────────────────────────────────────────────────────
describe("ownerToStr", () => {
  it("1（施設）は '1' を返す", () => {
    expect(ownerToStr(1)).toBe("1");
  });

  it("2（レンタル）は '2' を返す", () => {
    expect(ownerToStr(2)).toBe("2");
  });

  it("未知の値はFACILITYのデフォルト '1' を返す", () => {
    expect(ownerToStr(999)).toBe("1");
  });
});

// ─── statusToStr ─────────────────────────────────────────────────────────────
describe("statusToStr", () => {
  it("1（使用中）は '1' を返す", () => {
    expect(statusToStr(1)).toBe("1");
  });

  it("2（保管中）は '2' を返す", () => {
    expect(statusToStr(2)).toBe("2");
  });

  it("3（メンテナンス中）は '3' を返す", () => {
    expect(statusToStr(3)).toBe("3");
  });

  it("4（廃棄）は '4' を返す", () => {
    expect(statusToStr(4)).toBe("4");
  });

  it("未知の値はIN_USEのデフォルト '1' を返す", () => {
    expect(statusToStr(999)).toBe("1");
  });
});

// ─── mapAssetToFormDefaultValues ─────────────────────────────────────────────
describe("mapAssetToFormDefaultValues", () => {
  const baseAsset = {
    id: 1,
    name: "車椅子A",
    categoryId: 2,
    currentStorageId: 3,
    owner: 1,
    status: 1,
    roomNumberId: null,
    imageUrl: "https://example.com/img.jpg",
    notes: "備考あり",
  };

  it("基本フィールドが正しくマッピングされる", () => {
    const result = mapAssetToFormDefaultValues(baseAsset as any);
    expect(result.name).toBe("車椅子A");
    expect(result.categoryId).toBe("2");
    expect(result.storageId).toBe("3");
  });

  it("ownerが文字列に変換される", () => {
    const result = mapAssetToFormDefaultValues(baseAsset as any);
    expect(result.owner).toBe("1");
  });

  it("statusが文字列に変換される", () => {
    const result = mapAssetToFormDefaultValues(baseAsset as any);
    expect(result.status).toBe("1");
  });

  it("roomNumberIdがnullのとき undefinedになる", () => {
    const result = mapAssetToFormDefaultValues({ ...baseAsset, roomNumberId: null } as any);
    expect(result.roomNumberId).toBeUndefined();
  });

  it("roomNumberIdがある場合は文字列に変換される", () => {
    const result = mapAssetToFormDefaultValues({ ...baseAsset, roomNumberId: 5 } as any);
    expect(result.roomNumberId).toBe("5");
  });

  it("notesがnullのとき空文字になる", () => {
    const result = mapAssetToFormDefaultValues({ ...baseAsset, notes: null } as any);
    expect(result.notes).toBe("");
  });

  it("notesがundefinedのとき空文字になる", () => {
    const result = mapAssetToFormDefaultValues({ ...baseAsset, notes: undefined } as any);
    expect(result.notes).toBe("");
  });

  it("imageUrlがそのまま渡される", () => {
    const result = mapAssetToFormDefaultValues(baseAsset as any);
    expect(result.imageUrl).toBe("https://example.com/img.jpg");
  });

  it("idがそのまま渡される", () => {
    const result = mapAssetToFormDefaultValues(baseAsset as any);
    expect(result.id).toBe(1);
  });
});

// ─── mapItemToFormDefaultValues ───────────────────────────────────────────────
describe("mapItemToFormDefaultValues", () => {
  const baseItem = {
    name: "マスク",
    itemCode: "ITEM-001",
    unit: "枚",
    parLevel: 100,
    reorderPoint: 20,
    imageUrl: "https://example.com/mask.jpg",
    notes: "備考",
  };

  it("基本フィールドが正しくマッピングされる", () => {
    const result = mapItemToFormDefaultValues(baseItem as any);
    expect(result.name).toBe("マスク");
    expect(result.itemCode).toBe("ITEM-001");
    expect(result.unit).toBe("枚");
  });

  it("parLevelがそのまま渡される", () => {
    const result = mapItemToFormDefaultValues(baseItem as any);
    expect(result.parLevel).toBe(100);
  });

  it("parLevelがnullのときundefinedになる", () => {
    const result = mapItemToFormDefaultValues({ ...baseItem, parLevel: null } as any);
    expect(result.parLevel).toBeUndefined();
  });

  it("reorderPointがnullのときundefinedになる", () => {
    const result = mapItemToFormDefaultValues({ ...baseItem, reorderPoint: null } as any);
    expect(result.reorderPoint).toBeUndefined();
  });

  it("notesがnullのとき空文字になる", () => {
    const result = mapItemToFormDefaultValues({ ...baseItem, notes: null } as any);
    expect(result.notes).toBe("");
  });

  it("imageUrlがそのまま渡される", () => {
    const result = mapItemToFormDefaultValues(baseItem as any);
    expect(result.imageUrl).toBe("https://example.com/mask.jpg");
  });
});

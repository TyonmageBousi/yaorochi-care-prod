import { validateMasterData } from "@/lib/services/inBoundApi/inBoundService";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/lib/repositories/items/insertInBound", () => ({
    insertInBoundTransactions: jest.fn(),
    makeSelectChain: jest.fn(),
}));

import { makeSelectChain } from "@/lib/repositories/items/insertInBound";

const mockMakeSelectChain = makeSelectChain as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const makeRow = (itemId: number, storageId: number, qty = 1) => ({
    itemId,
    storageId,
    qty,
    notes: undefined,
});

const setupSelectChain = (itemIds: number[], storageIds: number[]) => {
    mockMakeSelectChain.mockResolvedValue({
        itemRows: itemIds.map((id) => ({ id })),
        storageRows: storageIds.map((id) => ({ id })),
    });
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
});

describe("validateMasterData（inBoundService）", () => {
    it("全て存在する場合エラーなし", async () => {
        setupSelectChain([1], [10]);

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors).toEqual({});
    });

    it("itemIdが存在しない場合エラーを返す", async () => {
        setupSelectChain([], [10]);

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors["rows.0.itemId"]).toBeDefined();
        expect(errors["rows.0.storageId"]).toBeUndefined();
    });

    it("storageIdが存在しない場合エラーを返す", async () => {
        setupSelectChain([1], []);

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors["rows.0.storageId"]).toBeDefined();
        expect(errors["rows.0.itemId"]).toBeUndefined();
    });

    it("itemIdとstorageIdの両方が存在しない場合両方エラーを返す", async () => {
        setupSelectChain([], []);

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors["rows.0.itemId"]).toBeDefined();
        expect(errors["rows.0.storageId"]).toBeDefined();
    });

    it("複数行で一部のitemIdだけ存在しない場合、該当行のみエラーを返す", async () => {
        setupSelectChain([1], [10]); // itemId:2 は存在しない

        const errors = await validateMasterData(1, [
            makeRow(1, 10),
            makeRow(2, 10),
        ]);

        expect(errors["rows.0.itemId"]).toBeUndefined();
        expect(errors["rows.1.itemId"]).toBeDefined();
    });

    it("複数行で一部のstorageIdだけ存在しない場合、該当行のみエラーを返す", async () => {
        setupSelectChain([1, 2], [10]); // storageId:20 は存在しない

        const errors = await validateMasterData(1, [
            makeRow(1, 10),
            makeRow(2, 20),
        ]);

        expect(errors["rows.0.storageId"]).toBeUndefined();
        expect(errors["rows.1.storageId"]).toBeDefined();
    });

    it("エラーメッセージに storageId の値が含まれる", async () => {
        setupSelectChain([1], []);

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors["rows.0.storageId"][0]).toContain("10");
    });
});

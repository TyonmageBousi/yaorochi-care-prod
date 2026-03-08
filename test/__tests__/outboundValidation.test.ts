import {
    validateMasterData,
    validateStock,
} from "@/lib/services/outBoundApi/outBoundValidation";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("@/db", () => ({
    db: {
        select: jest.fn(),
    },
}));
jest.mock("@/db/schema", () => ({
    items: { id: "id", facilityId: "facilityId" },
    storageLocations: { id: "id", facilityId: "facilityId" },
}));
jest.mock("drizzle-orm", () => ({
    and: jest.fn(),
    eq: jest.fn(),
    inArray: jest.fn(),
}));
jest.mock("@/lib/repositories/items/getItemStock", () => ({
    getCurrentStockQtyByItemIds: jest.fn(),
}));

import { db } from "@/db";

const mockDb = db as jest.Mocked<typeof db>;
const mockGetCurrentStockQtyByItemIds = getCurrentStockQtyByItemIds as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const makeRow = (itemId: number, storageId: number, qty = 1) => ({
    itemId,
    storageId,
    qty,
    notes: undefined,
});

const setupDbSelectMock = (itemIds: number[], storageIds: number[]) => {
    let callCount = 0;
    (mockDb.select as jest.Mock).mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(
                callCount++ === 0
                    ? itemIds.map((id) => ({ id }))
                    : storageIds.map((id) => ({ id }))
            ),
        }),
    }));
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════
// validateMasterData
// ════════════════════════════════════════════════════════════════
describe("validateMasterData", () => {
    it("全て存在する場合エラーなし", async () => {
        setupDbSelectMock([1], [10]);

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors).toEqual({});
    });

    it("itemIdが存在しない場合エラーを返す", async () => {
        setupDbSelectMock([], [10]); // itemが見つからない

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors["rows.0.itemId"]).toBeDefined();
        expect(errors["rows.0.storageId"]).toBeUndefined();
    });

    it("storageIdが存在しない場合エラーを返す", async () => {
        setupDbSelectMock([1], []); // storageが見つからない

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors["rows.0.storageId"]).toBeDefined();
        expect(errors["rows.0.itemId"]).toBeUndefined();
    });

    it("itemIdとstorageIdの両方が存在しない場合両方エラーを返す", async () => {
        setupDbSelectMock([], []);

        const errors = await validateMasterData(1, [makeRow(1, 10)]);
        expect(errors["rows.0.itemId"]).toBeDefined();
        expect(errors["rows.0.storageId"]).toBeDefined();
    });

    it("複数行で一部だけ存在しない場合、該当行のみエラーを返す", async () => {
        setupDbSelectMock([1], [10]); // itemId:2 は存在しない

        const errors = await validateMasterData(1, [
            makeRow(1, 10),
            makeRow(2, 10), // このitemIdが存在しない
        ]);

        expect(errors["rows.0.itemId"]).toBeUndefined();
        expect(errors["rows.1.itemId"]).toBeDefined();
    });
});

// ════════════════════════════════════════════════════════════════
// validateStock
// ════════════════════════════════════════════════════════════════
describe("validateStock", () => {
    it("在庫が十分な場合エラーなし", async () => {
        mockGetCurrentStockQtyByItemIds.mockResolvedValue(new Map([[1, 10]]));

        const errors = await validateStock(1, [makeRow(1, 10, 5)]);
        expect(errors).toEqual({});
    });

    it("在庫ちょうどの場合エラーなし", async () => {
        mockGetCurrentStockQtyByItemIds.mockResolvedValue(new Map([[1, 5]]));

        const errors = await validateStock(1, [makeRow(1, 10, 5)]);
        expect(errors).toEqual({});
    });

    it("在庫不足の場合エラーを返す", async () => {
        mockGetCurrentStockQtyByItemIds.mockResolvedValue(new Map([[1, 3]]));

        const errors = await validateStock(1, [makeRow(1, 10, 5)]);
        expect(errors["rows.0.qty"]).toBeDefined();
        expect(errors["rows.0.qty"][0]).toContain("在庫が不足");
    });

    it("在庫が0の場合エラーを返す", async () => {
        mockGetCurrentStockQtyByItemIds.mockResolvedValue(new Map([[1, 0]]));

        const errors = await validateStock(1, [makeRow(1, 10, 1)]);
        expect(errors["rows.0.qty"]).toBeDefined();
    });

    it("在庫マップにitemIdがない場合（在庫0扱い）エラーを返す", async () => {
        mockGetCurrentStockQtyByItemIds.mockResolvedValue(new Map()); // 空

        const errors = await validateStock(1, [makeRow(1, 10, 1)]);
        expect(errors["rows.0.qty"]).toBeDefined();
    });

    it("複数行で同一itemIdの合算が在庫を超える場合エラーを返す", async () => {
        mockGetCurrentStockQtyByItemIds.mockResolvedValue(new Map([[1, 5]]));

        // 3 + 4 = 7 > 在庫5
        const errors = await validateStock(1, [
            makeRow(1, 10, 3),
            makeRow(1, 10, 4),
        ]);
        expect(errors["rows.0.qty"]).toBeDefined();
    });

    it("複数行で合算が在庫以下の場合エラーなし", async () => {
        mockGetCurrentStockQtyByItemIds.mockResolvedValue(new Map([[1, 10]]));

        // 3 + 4 = 7 <= 在庫10
        const errors = await validateStock(1, [
            makeRow(1, 10, 3),
            makeRow(1, 10, 4),
        ]);
        expect(errors).toEqual({});
    });
});

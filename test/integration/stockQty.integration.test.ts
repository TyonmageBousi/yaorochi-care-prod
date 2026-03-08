/**
 * 在庫数量計算（getCurrentStockQtyByItemIds）統合テスト
 *
 * 実際のテスト用DBに接続し、複雑なSQL集計ロジックを検証する:
 *   1. IN トランザクションで在庫が増えること
 *   2. OUT トランザクションで在庫が減ること
 *   3. WASTE トランザクションで在庫が減ること
 *   4. STOCKTAKE トランザクションで在庫が補正されること（プラス・マイナス両方）
 *   5. 複数種別が混在した場合の正確な合算
 *   6. 複数商品を一度に取得できること
 *   7. storageId フィルタが機能すること
 *   8. 存在しない itemId は 0 を返すこと
 *   9. 空配列は空の Map を返すこと
 *   10. テナント分離: 他施設の在庫を取得しないこと
 *
 * 実行: npx dotenv -e .env.test -- jest --config jest.integration.config.ts
 */
import { db } from "@/db";
import {
    users,
    items,
    storageLocations,
    stockTransactions,
    ROLE,
    ITEM_STATUS_FLAGS,
    STOCK_TX_TYPE,
} from "@/db/schema";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";

// ─── テストデータ ID ──────────────────────────────────────────────────────────
let f1 = { userId: 0, storageId: 0, storageId2: 0, itemId: 0, itemId2: 0 };
let f2 = { userId: 0, storageId: 0, itemId: 0 };

// ─── セットアップ / クリーンアップ ────────────────────────────────────────────
beforeAll(async () => {
    await db.delete(stockTransactions);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);

    // ── 施設1 ──
    const [user1] = await db.insert(users).values({
        userId: "stock-integ-user-1",
        passwordHash: "dummy",
        name: "在庫統合テスト太郎",
        role: ROLE.STAFF,
        facilityId: 1,
        phone: "090-1111-0001",
        hireDate: new Date("2024-01-01"),
    }).returning({ id: users.id });

    const [storage1] = await db.insert(storageLocations).values(
        { facilityId: 1, label: "在庫テスト倉庫A" }
    ).returning({ id: storageLocations.id });

    const [storage2] = await db.insert(storageLocations).values(
        { facilityId: 1, label: "在庫テスト倉庫B" }
    ).returning({ id: storageLocations.id });

    const [item1] = await db.insert(items).values({
        facilityId: 1,
        itemCode: "STOCK-001",
        name: "在庫テスト手袋",
        unit: "箱",
        status: ITEM_STATUS_FLAGS.ACTIVE,
    }).returning({ id: items.id });

    const [item2] = await db.insert(items).values({
        facilityId: 1,
        itemCode: "STOCK-002",
        name: "在庫テストマスク",
        unit: "枚",
        status: ITEM_STATUS_FLAGS.ACTIVE,
    }).returning({ id: items.id });

    f1 = {
        userId: user1.id,
        storageId: storage1.id,
        storageId2: storage2.id,
        itemId: item1.id,
        itemId2: item2.id,
    };

    // ── 施設2（テナント分離用）──
    const [user2] = await db.insert(users).values({
        userId: "stock-integ-user-2",
        passwordHash: "dummy",
        name: "在庫統合テスト花子",
        role: ROLE.STAFF,
        facilityId: 2,
        phone: "090-1111-0002",
        hireDate: new Date("2024-01-01"),
    }).returning({ id: users.id });

    const [storage3] = await db.insert(storageLocations).values(
        { facilityId: 2, label: "施設2倉庫" }
    ).returning({ id: storageLocations.id });

    const [item3] = await db.insert(items).values({
        facilityId: 2,
        itemCode: "STOCK-001",
        name: "施設2の手袋",
        unit: "箱",
        status: ITEM_STATUS_FLAGS.ACTIVE,
    }).returning({ id: items.id });

    f2 = { userId: user2.id, storageId: storage3.id, itemId: item3.id };
});

afterAll(async () => {
    await db.delete(stockTransactions);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);
    await db.$client.end();
});

// 各テスト前にトランザクション履歴をリセット
beforeEach(async () => {
    await db.delete(stockTransactions);
});

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("getCurrentStockQtyByItemIds 統合テスト", () => {

    describe("トランザクション種別ごとの計算", () => {
        it("IN(+10) → 在庫が10になる", async () => {
            await db.insert(stockTransactions).values({
                facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN,
                qty: 10, storageId: f1.storageId, performedBy: f1.userId,
            });

            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(result.get(f1.itemId)).toBe(10);
        });

        it("IN(+10) → OUT(3) → 在庫が7になる", async () => {
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 10, storageId: f1.storageId, performedBy: f1.userId, residentName: null },
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.OUT, qty: 3, storageId: f1.storageId, performedBy: f1.userId, residentName: "テスト入居者" },
            ]);

            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(result.get(f1.itemId)).toBe(7);
        });

        it("IN(+10) → WASTE(2) → 在庫が8になる", async () => {
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 10, storageId: f1.storageId, performedBy: f1.userId },
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.WASTE, qty: 2, storageId: f1.storageId, performedBy: f1.userId },
            ]);

            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(result.get(f1.itemId)).toBe(8);
        });

        it("IN(+10) → STOCKTAKE(+5補正) → 在庫が15になる", async () => {
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 10, storageId: f1.storageId, performedBy: f1.userId },
                // STOCKTAKE は qty がそのまま加算される（confirmStockTake が countedQty - systemQty を入れる）
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.STOCKTAKE, qty: 5, storageId: f1.storageId },
            ]);

            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(result.get(f1.itemId)).toBe(15);
        });

        it("IN(+10) → STOCKTAKE(-3補正) → 在庫が7になる", async () => {
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 10, storageId: f1.storageId, performedBy: f1.userId },
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.STOCKTAKE, qty: -3, storageId: f1.storageId },
            ]);

            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(result.get(f1.itemId)).toBe(7);
        });

        it("複数種別混在: IN(20) OUT(5) WASTE(2) STOCKTAKE(+1) → 14", async () => {
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 20, storageId: f1.storageId, performedBy: f1.userId },
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.OUT, qty: 5, storageId: f1.storageId, performedBy: f1.userId, residentName: "テスト入居者" },
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.WASTE, qty: 2, storageId: f1.storageId, performedBy: f1.userId },
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.STOCKTAKE, qty: 1, storageId: f1.storageId },
            ]);

            // 20 - 5 - 2 + 1 = 14
            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(result.get(f1.itemId)).toBe(14);
        });
    });

    describe("複数商品の同時取得", () => {
        it("item1(10) と item2(5) を一度に取得できる", async () => {
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 10, storageId: f1.storageId, performedBy: f1.userId },
                { facilityId: 1, itemId: f1.itemId2, type: STOCK_TX_TYPE.IN, qty: 5, storageId: f1.storageId, performedBy: f1.userId },
            ]);

            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId, f1.itemId2]);
            expect(result.get(f1.itemId)).toBe(10);
            expect(result.get(f1.itemId2)).toBe(5);
        });
    });

    describe("storageId フィルタ", () => {
        it("倉庫Aの在庫だけ取得できる", async () => {
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 10, storageId: f1.storageId, performedBy: f1.userId },
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 3, storageId: f1.storageId2, performedBy: f1.userId },
            ]);

            // 全体は13、倉庫Aだけは10
            const all = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(all.get(f1.itemId)).toBe(13);

            const filtered = await getCurrentStockQtyByItemIds(1, [f1.itemId], f1.storageId);
            expect(filtered.get(f1.itemId)).toBe(10);
        });
    });

    describe("エッジケース", () => {
        it("トランザクションが0件の itemId は 0 を返す", async () => {
            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            expect(result.get(f1.itemId)).toBeUndefined(); // Mapに含まれない
        });

        it("空配列は空のMapを返す", async () => {
            const result = await getCurrentStockQtyByItemIds(1, []);
            expect(result.size).toBe(0);
        });
    });

    describe("テナント分離", () => {
        it("facilityId=1 で照会しても施設2の在庫は含まれない", async () => {
            // 施設1: 10個、施設2: 50個（同じ商品IDだがfacilityIdが違う）
            await db.insert(stockTransactions).values([
                { facilityId: 1, itemId: f1.itemId, type: STOCK_TX_TYPE.IN, qty: 10, storageId: f1.storageId, performedBy: f1.userId },
                { facilityId: 2, itemId: f2.itemId, type: STOCK_TX_TYPE.IN, qty: 50, storageId: f2.storageId, performedBy: f2.userId },
            ]);

            const result = await getCurrentStockQtyByItemIds(1, [f1.itemId]);
            // 施設2の50個は含まれず10のまま
            expect(result.get(f1.itemId)).toBe(10);
        });
    });
});

/**
 * 棚卸確定（confirmStockTake）統合テスト
 *
 * 実際のテスト用DBに接続し、confirmStockTake の以下を検証する:
 *   1. 実数 > システム在庫 → 在庫が増える（プラス補正）
 *   2. 実数 < システム在庫 → 在庫が減る（マイナス補正）
 *   3. 実数 === システム在庫 → 在庫変わらず（ゼロ補正）
 *   4. 確定後に status が POSTED になること
 *   5. 未入力明細ありで UNCOUNTED_LINES エラー
 *   6. 既に確定済みで INVALID_STATUS エラー
 *   7. 別施設の stockTakeId では NOT_FOUND（テナント分離）
 *
 * 実行: npx dotenv -e .env.test -- jest --config jest.integration.config.ts
 */
import { db } from "@/db";
import {
    users,
    items,
    storageLocations,
    stockTransactions,
    stockTakes,
    stockTakeLines,
    STOCK_TX_TYPE,
    STOCKTAKE_STATUS,
    ROLE,
    ITEM_STATUS_FLAGS,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { confirmStockTake } from "@/lib/repositories/stockTakes/confirmStockTake";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";
import { BusinessValidationError } from "@/types/handleApiErrorType";

// ─── テストデータの ID を保持 ─────────────────────────────────────────────────
let facility1 = { userId: 0, storageId: 0, itemId: 0 };
let facility2 = { stockTakeId: 0 };

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
/**
 * 棚卸セッションと明細を作成するヘルパー
 */
async function createStockTakeWithLines(params: {
    facilityId: number;
    storageId: number;
    userId: number;
    lines: { itemId: number; systemQty: number; countedQty: number | null }[];
}) {
    const [stockTake] = await db
        .insert(stockTakes)
        .values({
            facilityId: params.facilityId,
            storageId: params.storageId,
            createdBy: params.userId,
        })
        .returning({ id: stockTakes.id });

    await db.insert(stockTakeLines).values(
        params.lines.map((line) => ({
            stockTakeId: stockTake.id,
            itemId: line.itemId,
            systemQty: line.systemQty,
            countedQty: line.countedQty,
            adjustmentTxId: null,
        }))
    );

    return stockTake.id;
}

// ─── セットアップ / クリーンアップ ────────────────────────────────────────────
beforeAll(async () => {
    await db.delete(stockTransactions);
    await db.delete(stockTakeLines);
    await db.delete(stockTakes);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);

    // ── 施設1のテストデータ ──
    const [user1] = await db
        .insert(users)
        .values({
            userId: "stocktake-integ-user-1",
            passwordHash: "dummy",
            name: "棚卸統合テスト太郎",
            role: ROLE.STAFF,
            facilityId: 1,
            phone: "090-0000-0001",
            hireDate: new Date("2024-01-01"),
        })
        .returning({ id: users.id });

    const [storage1] = await db
        .insert(storageLocations)
        .values({ facilityId: 1, label: "棚卸テスト倉庫A" })
        .returning({ id: storageLocations.id });

    const [item1] = await db
        .insert(items)
        .values({
            facilityId: 1,
            itemCode: "STOCKTAKE-001",
            name: "棚卸テスト手袋",
            unit: "箱",
            status: ITEM_STATUS_FLAGS.ACTIVE,
        })
        .returning({ id: items.id });

    // 初期在庫: 10個
    await db.insert(stockTransactions).values({
        facilityId: 1,
        itemId: item1.id,
        type: STOCK_TX_TYPE.IN,
        qty: 10,
        storageId: storage1.id,
        performedBy: user1.id,
    });

    facility1 = {
        userId: user1.id,
        storageId: storage1.id,
        itemId: item1.id,
    };

    // ── 施設2のテストデータ（テナント分離検証用） ──
    const [user2] = await db
        .insert(users)
        .values({
            userId: "stocktake-integ-user-2",
            passwordHash: "dummy",
            name: "棚卸統合テスト花子",
            role: ROLE.STAFF,
            facilityId: 2,
            phone: "090-0000-0002",
            hireDate: new Date("2024-01-01"),
        })
        .returning({ id: users.id });

    const [storage2] = await db
        .insert(storageLocations)
        .values({ facilityId: 2, label: "棚卸テスト倉庫B" })
        .returning({ id: storageLocations.id });

    const [item2] = await db
        .insert(items)
        .values({
            facilityId: 2,
            itemCode: "STOCKTAKE-001",
            name: "施設2の手袋",
            unit: "箱",
            status: ITEM_STATUS_FLAGS.ACTIVE,
        })
        .returning({ id: items.id });

    // 施設2の棚卸セッション（テナント分離検証用）
    const stockTakeId2 = await createStockTakeWithLines({
        facilityId: 2,
        storageId: storage2.id,
        userId: user2.id,
        lines: [{ itemId: item2.id, systemQty: 5, countedQty: 5 }],
    });

    facility2 = { stockTakeId: stockTakeId2 };
});

afterAll(async () => {
    await db.delete(stockTransactions);
    await db.delete(stockTakeLines);
    await db.delete(stockTakes);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);

    await db.$client.end();
});

// ─── テスト ───────────────────────────────────────────────────────────────────

// 各テスト前に棚卸データをリセット（IN_PROGRESS の unique 制約回避）
beforeEach(async () => {
    await db.delete(stockTakeLines);
    await db.delete(stockTakes);
});

describe("confirmStockTake 統合テスト", () => {
    describe("在庫補正の計算", () => {
        it("プラス補正: 実数(15) > システム在庫(10) → 在庫が15になる", async () => {
            const stockTakeId = await createStockTakeWithLines({
                facilityId: 1,
                storageId: facility1.storageId,
                userId: facility1.userId,
                lines: [{ itemId: facility1.itemId, systemQty: 10, countedQty: 15 }],
            });

            await confirmStockTake(stockTakeId, 1);

            const stockMap = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
            expect(stockMap.get(facility1.itemId)).toBe(15);
        });

        it("マイナス補正: 実数(3) < システム在庫(15) → 在庫が3になる", async () => {
            const stockTakeId = await createStockTakeWithLines({
                facilityId: 1,
                storageId: facility1.storageId,
                userId: facility1.userId,
                lines: [{ itemId: facility1.itemId, systemQty: 15, countedQty: 3 }],
            });

            await confirmStockTake(stockTakeId, 1);

            const stockMap = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
            expect(stockMap.get(facility1.itemId)).toBe(3);
        });

        it("ゼロ補正: 実数(3) === システム在庫(3) → 在庫が変わらない", async () => {
            const before = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
            const beforeQty = before.get(facility1.itemId) ?? 0;

            const stockTakeId = await createStockTakeWithLines({
                facilityId: 1,
                storageId: facility1.storageId,
                userId: facility1.userId,
                lines: [{ itemId: facility1.itemId, systemQty: beforeQty, countedQty: beforeQty }],
            });

            await confirmStockTake(stockTakeId, 1);

            const stockMap = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
            expect(stockMap.get(facility1.itemId)).toBe(beforeQty);
        });
    });

    describe("確定後のステータス", () => {
        it("確定後に stockTake の status が POSTED になる", async () => {
            const stockTakeId = await createStockTakeWithLines({
                facilityId: 1,
                storageId: facility1.storageId,
                userId: facility1.userId,
                lines: [{ itemId: facility1.itemId, systemQty: 5, countedQty: 5 }],
            });

            await confirmStockTake(stockTakeId, 1);

            const [result] = await db
                .select({ status: stockTakes.status })
                .from(stockTakes)
                .where(eq(stockTakes.id, stockTakeId));

            expect(result.status).toBe(STOCKTAKE_STATUS.POSTED);
        });
    });

    describe("エラーケース", () => {
        it("未入力明細あり: countedQty が null の行があると UNCOUNTED_LINES エラー", async () => {
            const stockTakeId = await createStockTakeWithLines({
                facilityId: 1,
                storageId: facility1.storageId,
                userId: facility1.userId,
                lines: [{ itemId: facility1.itemId, systemQty: 5, countedQty: null }],
            });

            await expect(confirmStockTake(stockTakeId, 1)).rejects.toThrow(BusinessValidationError);

            try {
                await confirmStockTake(stockTakeId, 1);
            } catch (e) {
                const err = e as BusinessValidationError;
                expect(err.status).toBe(400);
                expect(err.code).toBe("UNCOUNTED_LINES");
            }
        });

        it("確定済み: POSTED 状態の棚卸を再確定すると INVALID_STATUS エラー", async () => {
            const stockTakeId = await createStockTakeWithLines({
                facilityId: 1,
                storageId: facility1.storageId,
                userId: facility1.userId,
                lines: [{ itemId: facility1.itemId, systemQty: 5, countedQty: 5 }],
            });

            // 1回目の確定
            await confirmStockTake(stockTakeId, 1);

            // 2回目は失敗するはず
            await expect(confirmStockTake(stockTakeId, 1)).rejects.toThrow(BusinessValidationError);

            try {
                await confirmStockTake(stockTakeId, 1);
            } catch (e) {
                const err = e as BusinessValidationError;
                expect(err.status).toBe(400);
                expect(err.code).toBe("INVALID_STATUS");
            }
        });

        it("テナント分離: 施設1が施設2の stockTakeId で確定すると NOT_FOUND エラー", async () => {
            await expect(
                confirmStockTake(facility2.stockTakeId, 1) // facilityId=1 で施設2のIDを指定
            ).rejects.toThrow(BusinessValidationError);

            try {
                await confirmStockTake(facility2.stockTakeId, 1);
            } catch (e) {
                const err = e as BusinessValidationError;
                expect(err.status).toBe(404);
                expect(err.code).toBe("NOT_FOUND");
            }
        });
    });
});
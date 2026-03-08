/**
 * 入庫（inbound）統合テスト
 *
 * 実際のテスト用DBに接続し、processInbound の以下を検証する:
 *   1. 正常入庫で在庫が増えること
 *   2. 複数行の入庫で在庫がまとめて増えること
 *   3. 別施設の itemId では 422 が返ること（テナント分離）
 *   4. 別施設の storageId では 422 が返ること（テナント分離）
 *
 * 実行: npx dotenv -e .env.test -- jest --config jest.integration.config.ts
 */
import { db } from "@/db";
import {
    users,
    items,
    storageLocations,
    stockTransactions,
    stockTakeLines,
    stockTakes,
    ROLE,
    ITEM_STATUS_FLAGS,
} from "@/db/schema";
import { processInbound } from "@/lib/services/inBoundApi/inBoundService";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";
import { BusinessValidationError } from "@/types/handleApiErrorType";

// ─── テストデータの ID を保持 ─────────────────────────────────────────────────
let facility1 = { userId: 0, storageId: 0, itemId: 0 };
let facility2 = { userId: 0, storageId: 0, itemId: 0 };

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
            userId: "inbound-integ-user-1",
            passwordHash: "dummy",
            name: "入庫統合テスト太郎",
            role: ROLE.STAFF,
            facilityId: 1,
            phone: "090-0000-0001",
            hireDate: new Date("2024-01-01"),
        })
        .returning({ id: users.id });

    const [storage1] = await db
        .insert(storageLocations)
        .values({ facilityId: 1, label: "入庫テスト倉庫A" })
        .returning({ id: storageLocations.id });

    const [item1] = await db
        .insert(items)
        .values({
            facilityId: 1,
            itemCode: "INBOUND-001",
            name: "入庫テスト手袋",
            unit: "箱",
            status: ITEM_STATUS_FLAGS.ACTIVE,
        })
        .returning({ id: items.id });

    facility1 = {
        userId: user1.id,
        storageId: storage1.id,
        itemId: item1.id,
    };

    // ── 施設2のテストデータ（テナント分離検証用） ──
    const [user2] = await db
        .insert(users)
        .values({
            userId: "inbound-integ-user-2",
            passwordHash: "dummy",
            name: "入庫統合テスト花子",
            role: ROLE.STAFF,
            facilityId: 2,
            phone: "090-0000-0002",
            hireDate: new Date("2024-01-01"),
        })
        .returning({ id: users.id });

    const [storage2] = await db
        .insert(storageLocations)
        .values({ facilityId: 2, label: "入庫テスト倉庫B" })
        .returning({ id: storageLocations.id });

    const [item2] = await db
        .insert(items)
        .values({
            facilityId: 2,
            itemCode: "INBOUND-001",
            name: "施設2の手袋",
            unit: "箱",
            status: ITEM_STATUS_FLAGS.ACTIVE,
        })
        .returning({ id: items.id });

    facility2 = {
        userId: user2.id,
        storageId: storage2.id,
        itemId: item2.id,
    };
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
describe("processInbound 統合テスト", () => {
    it("正常入庫: 在庫0から5個入庫すると在庫が5になる", async () => {
        await processInbound(
            {
                rows: [{ itemId: facility1.itemId, storageId: facility1.storageId, qty: 5 }],
            },
            1,
            facility1.userId
        );

        const stockMap = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
        expect(stockMap.get(facility1.itemId)).toBe(5);
    });

    it("複数回入庫: さらに3個入庫すると在庫が8になる", async () => {
        await processInbound(
            {
                rows: [{ itemId: facility1.itemId, storageId: facility1.storageId, qty: 3 }],
            },
            1,
            facility1.userId
        );

        const stockMap = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
        expect(stockMap.get(facility1.itemId)).toBe(8);
    });

    it("複数行入庫: 同一商品を別々の行で入庫すると合算される", async () => {
        const before = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
        const beforeQty = before.get(facility1.itemId) ?? 0;

        await processInbound(
            {
                rows: [
                    { itemId: facility1.itemId, storageId: facility1.storageId, qty: 2 },
                    { itemId: facility1.itemId, storageId: facility1.storageId, qty: 3 },
                ],
            },
            1,
            facility1.userId
        );

        const stockMap = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
        expect(stockMap.get(facility1.itemId)).toBe(beforeQty + 5);
    });

    it("テナント分離: 施設1のユーザーが施設2のitemIdで入庫すると BusinessValidationError(422)", async () => {
        await expect(
            processInbound(
                {
                    rows: [{ itemId: facility2.itemId, storageId: facility1.storageId, qty: 1 }],
                },
                1,
                facility1.userId
            )
        ).rejects.toThrow(BusinessValidationError);

        try {
            await processInbound(
                {
                    rows: [{ itemId: facility2.itemId, storageId: facility1.storageId, qty: 1 }],
                },
                1,
                facility1.userId
            );
        } catch (e) {
            const err = e as BusinessValidationError;
            expect(err.status).toBe(422);
            expect(err.code).toBe("VALIDATION_ERROR");
            expect(Object.keys(err.details!).some((k) => k.includes("itemId"))).toBe(true);
        }
    });

    it("テナント分離: 施設1のユーザーが施設2のstorageIdで入庫すると BusinessValidationError(422)", async () => {
        await expect(
            processInbound(
                {
                    rows: [{ itemId: facility1.itemId, storageId: facility2.storageId, qty: 1 }],
                },
                1,
                facility1.userId
            )
        ).rejects.toThrow(BusinessValidationError);

        try {
            await processInbound(
                {
                    rows: [{ itemId: facility1.itemId, storageId: facility2.storageId, qty: 1 }],
                },
                1,
                facility1.userId
            );
        } catch (e) {
            const err = e as BusinessValidationError;
            expect(err.status).toBe(422);
            expect(Object.keys(err.details!).some((k) => k.includes("storageId"))).toBe(true);
        }
    });
});
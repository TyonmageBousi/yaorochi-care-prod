/**
 * 払出（outbound）統合テスト
 *
 * 実際のテスト用DBに接続し、processOutbound の以下を検証する:
 *   1. 正常払出で在庫が減ること
 *   2. 在庫不足で 422 相当の BusinessValidationError が投げられること
 *   3. 別施設の itemId では 422 が返ること（テナント分離）
 *
 * 実行: npx dotenv -e .env.test -- jest --config jest.integration.config.ts
 */
import { db } from "@/db";
import {
    users,
    items,
    storageLocations,
    roomNumbers,
    stockTransactions,
    STOCK_TX_TYPE,
    ROLE,
    ITEM_STATUS_FLAGS,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { processOutbound } from "@/lib/services/outBoundApi/outBoundService";
import { getCurrentStockQtyByItemIds } from "@/lib/repositories/items/getItemStock";
import { BusinessValidationError } from "@/types/handleApiErrorType";

// ─── テストデータの ID を保持 ─────────────────────────────────────────────────
let facility1 = { userId: 0, storageId: 0, roomId: 0, itemId: 0 };
let facility2 = { userId: 0, storageId: 0, roomId: 0, itemId: 0 };

// ─── セットアップ / クリーンアップ ────────────────────────────────────────────
beforeAll(async () => {
    // テーブルを安全にクリア（依存順）
    await db.delete(stockTransactions);
    await db.delete(roomNumbers);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);

    // ── 施設1のテストデータ ──
    const [user1] = await db
        .insert(users)
        .values({
            userId: "integ-user-1",
            passwordHash: "dummy",
            name: "統合テスト太郎",
            role: ROLE.STAFF,
            facilityId: 1,
            phone: "090-0000-0001",
            hireDate: new Date("2024-01-01"),
        })
        .returning({ id: users.id });

    const [storage1] = await db
        .insert(storageLocations)
        .values({ facilityId: 1, label: "テスト倉庫A" })
        .returning({ id: storageLocations.id });

    const [room1] = await db
        .insert(roomNumbers)
        .values({ facilityId: 1, label: "T-101", residentName: "テスト入居者" })
        .returning({ id: roomNumbers.id });

    const [item1] = await db
        .insert(items)
        .values({
            facilityId: 1,
            itemCode: "INTEG-001",
            name: "統合テスト手袋",
            unit: "箱",
            status: ITEM_STATUS_FLAGS.ACTIVE,
        })
        .returning({ id: items.id });

    // 初期在庫: 10個を入庫
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
        roomId: room1.id,
        itemId: item1.id,
    };

    // ── 施設2のテストデータ（テナント分離検証用） ──
    const [user2] = await db
        .insert(users)
        .values({
            userId: "integ-user-2",
            passwordHash: "dummy",
            name: "統合テスト花子",
            role: ROLE.STAFF,
            facilityId: 2,
            phone: "090-0000-0002",
            hireDate: new Date("2024-01-01"),
        })
        .returning({ id: users.id });

    const [storage2] = await db
        .insert(storageLocations)
        .values({ facilityId: 2, label: "テスト倉庫B" })
        .returning({ id: storageLocations.id });

    const [room2] = await db
        .insert(roomNumbers)
        .values({ facilityId: 2, label: "T-201", residentName: "テスト入居者2" })
        .returning({ id: roomNumbers.id });

    const [item2] = await db
        .insert(items)
        .values({
            facilityId: 2,
            itemCode: "INTEG-001",
            name: "施設2の手袋",
            unit: "箱",
            status: ITEM_STATUS_FLAGS.ACTIVE,
        })
        .returning({ id: items.id });

    // 施設2にも在庫を入れておく
    await db.insert(stockTransactions).values({
        facilityId: 2,
        itemId: item2.id,
        type: STOCK_TX_TYPE.IN,
        qty: 20,
        storageId: storage2.id,
        performedBy: user2.id,
    });

    facility2 = {
        userId: user2.id,
        storageId: storage2.id,
        roomId: room2.id,
        itemId: item2.id,
    };
});

afterAll(async () => {
    // テストデータ掃除
    await db.delete(stockTransactions);
    await db.delete(roomNumbers);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);

    // DB接続を閉じる
    await db.$client.end();
});

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("processOutbound 統合テスト", () => {
    it("正常払出: 在庫10から3個払出すると在庫が7になる", async () => {
        await processOutbound(
            {
                roomId: facility1.roomId,
                rows: [{ itemId: facility1.itemId, storageId: facility1.storageId, qty: 3 }],
            },
            1, // facilityId
            facility1.userId
        );

        const stockMap = await getCurrentStockQtyByItemIds(1, [facility1.itemId]);
        expect(stockMap.get(facility1.itemId)).toBe(7);
    });

    it("在庫不足: 残り7に対して10個払出しようとすると BusinessValidationError(422)", async () => {
        await expect(
            processOutbound(
                {
                    roomId: facility1.roomId,
                    rows: [{ itemId: facility1.itemId, storageId: facility1.storageId, qty: 10 }],
                },
                1,
                facility1.userId
            )
        ).rejects.toThrow(BusinessValidationError);

        try {
            await processOutbound(
                {
                    roomId: facility1.roomId,
                    rows: [{ itemId: facility1.itemId, storageId: facility1.storageId, qty: 10 }],
                },
                1,
                facility1.userId
            );
        } catch (e) {
            const err = e as BusinessValidationError;
            expect(err.status).toBe(422);
            expect(err.details).toBeDefined();
            expect(Object.keys(err.details!).some((k) => k.includes("qty"))).toBe(true);
        }
    });

    it("テナント分離: 施設1のユーザーが施設2のitemIdで払出すると BusinessValidationError(422)", async () => {
        // 施設2のitemIdを施設1として払出しようとする
        await expect(
            processOutbound(
                {
                    roomId: facility1.roomId,
                    rows: [{ itemId: facility2.itemId, storageId: facility1.storageId, qty: 1 }],
                },
                1, // facilityId = 1 だが itemId は施設2のもの
                facility1.userId
            )
        ).rejects.toThrow(BusinessValidationError);

        try {
            await processOutbound(
                {
                    roomId: facility1.roomId,
                    rows: [{ itemId: facility2.itemId, storageId: facility1.storageId, qty: 1 }],
                },
                1,
                facility1.userId
            );
        } catch (e) {
            const err = e as BusinessValidationError;
            expect(err.status).toBe(422);
            expect(err.code).toBe("VALIDATION_ERROR");
            // itemIdが見つからないエラーになること
            expect(err.details).toBeDefined();
            expect(Object.keys(err.details!).some((k) => k.includes("itemId"))).toBe(true);
        }
    });

    it("テナント分離: 施設1のユーザーが施設2のroomIdで払出すると BusinessValidationError(422)", async () => {
        await expect(
            processOutbound(
                {
                    roomId: facility2.roomId, // 施設2の部屋
                    rows: [{ itemId: facility1.itemId, storageId: facility1.storageId, qty: 1 }],
                },
                1, // facilityId = 1
                facility1.userId
            )
        ).rejects.toThrow(BusinessValidationError);

        try {
            await processOutbound(
                {
                    roomId: facility2.roomId,
                    rows: [{ itemId: facility1.itemId, storageId: facility1.storageId, qty: 1 }],
                },
                1,
                facility1.userId
            );
        } catch (e) {
            const err = e as BusinessValidationError;
            expect(err.status).toBe(422);
            // roomIdが見つからないエラーになること
            expect(err.details?.roomId).toBeDefined();
        }
    });

    it("在庫不足(aggregateByKey経由): 残り7に対して同じ商品を4+4=8で払出すと在庫不足", async () => {
        await expect(
            processOutbound(
                {
                    roomId: facility1.roomId,
                    rows: [
                        { itemId: facility1.itemId, storageId: facility1.storageId, qty: 4 },
                        { itemId: facility1.itemId, storageId: facility1.storageId, qty: 4 },
                    ],
                },
                1,
                facility1.userId
            )
        ).rejects.toThrow(BusinessValidationError);
    });
});
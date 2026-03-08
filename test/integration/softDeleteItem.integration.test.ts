/**
 * 消耗品論理削除（softDeleteItemByFacilityAndId）統合テスト
 *
 * 実際のテスト用DBに接続し、以下を検証する:
 *   1. 正常削除: status が DELETED になり row が返ること
 *   2. 二重削除ガード: 削除済み商品を再度削除すると null が返ること
 *   3. 存在しない itemId は null が返ること
 *   4. テナント分離: 他施設の itemId では null が返ること
 *
 * 実行: npx dotenv -e .env.test -- jest --config jest.integration.config.ts
 */
import { db } from "@/db";
import { users, items, storageLocations, stockTransactions, ROLE, ITEM_STATUS_FLAGS } from "@/db/schema";
import { eq } from "drizzle-orm";
import { softDeleteItemByFacilityAndId } from "@/lib/repositories/items/softDeleteItemByFacilityAndId";

// ─── テストデータ ID ──────────────────────────────────────────────────────────
let f1 = { itemId: 0 };
let f2 = { itemId: 0 };

// ─── セットアップ / クリーンアップ ────────────────────────────────────────────
beforeAll(async () => {
    await db.delete(stockTransactions);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);

    await db.insert(users).values([
        {
            userId: "softdel-integ-user-1",
            passwordHash: "dummy",
            name: "論理削除統合テスト太郎",
            role: ROLE.STAFF,
            facilityId: 1,
            phone: "090-3333-0001",
            hireDate: new Date("2024-01-01"),
        },
        {
            userId: "softdel-integ-user-2",
            passwordHash: "dummy",
            name: "論理削除統合テスト花子",
            role: ROLE.STAFF,
            facilityId: 2,
            phone: "090-3333-0002",
            hireDate: new Date("2024-01-01"),
        },
    ]);
});

afterAll(async () => {
    await db.delete(stockTransactions);
    await db.delete(items);
    await db.delete(storageLocations);
    await db.delete(users);
    await db.$client.end();
});

// 各テスト前にitemsをリセットして新しいテストデータを用意
beforeEach(async () => {
    await db.delete(items);

    const [item1] = await db.insert(items).values({
        facilityId: 1,
        itemCode: "SOFTDEL-001",
        name: "削除テスト手袋",
        unit: "箱",
        status: ITEM_STATUS_FLAGS.ACTIVE,
    }).returning({ id: items.id });

    const [item2] = await db.insert(items).values({
        facilityId: 2,
        itemCode: "SOFTDEL-001",
        name: "施設2の削除テスト手袋",
        unit: "箱",
        status: ITEM_STATUS_FLAGS.ACTIVE,
    }).returning({ id: items.id });

    f1 = { itemId: item1.id };
    f2 = { itemId: item2.id };
});

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("softDeleteItemByFacilityAndId 統合テスト", () => {

    describe("正常系", () => {
        it("削除に成功し row が返る", async () => {
            const result = await softDeleteItemByFacilityAndId(1, f1.itemId);

            expect(result).not.toBeNull();
            expect(result!.id).toBe(f1.itemId);
        });

        it("削除後に DB の status が DELETED になる", async () => {
            await softDeleteItemByFacilityAndId(1, f1.itemId);

            const [saved] = await db
                .select({ status: items.status })
                .from(items)
                .where(eq(items.id, f1.itemId));

            expect(saved.status).toBe(ITEM_STATUS_FLAGS.DELETED);
        });
    });

    describe("二重削除ガード", () => {
        it("削除済み商品を再度削除すると null が返る", async () => {
            // 1回目
            await softDeleteItemByFacilityAndId(1, f1.itemId);

            // 2回目 → ne(status, DELETED) 条件で対象なし
            const result = await softDeleteItemByFacilityAndId(1, f1.itemId);
            expect(result).toBeNull();
        });

        it("二重削除後もDBのレコードはDELETEDのまま（上書きされない）", async () => {
            await softDeleteItemByFacilityAndId(1, f1.itemId);
            await softDeleteItemByFacilityAndId(1, f1.itemId);

            const [saved] = await db
                .select({ status: items.status })
                .from(items)
                .where(eq(items.id, f1.itemId));

            expect(saved.status).toBe(ITEM_STATUS_FLAGS.DELETED);
        });
    });

    describe("存在しないID", () => {
        it("存在しない itemId は null が返る", async () => {
            const result = await softDeleteItemByFacilityAndId(1, 999999);
            expect(result).toBeNull();
        });
    });

    describe("テナント分離", () => {
        it("施設1が施設2の itemId を削除しようとしても null が返る", async () => {
            // facilityId=1 で施設2の itemId を指定
            const result = await softDeleteItemByFacilityAndId(1, f2.itemId);
            expect(result).toBeNull();
        });

        it("テナント分離失敗でも施設2の商品は ACTIVE のまま", async () => {
            await softDeleteItemByFacilityAndId(1, f2.itemId);

            const [saved] = await db
                .select({ status: items.status })
                .from(items)
                .where(eq(items.id, f2.itemId));

            expect(saved.status).toBe(ITEM_STATUS_FLAGS.ACTIVE);
        });
    });
});

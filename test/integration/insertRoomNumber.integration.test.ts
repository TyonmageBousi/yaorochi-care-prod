/**
 * 部屋番号登録（insertRoomNumber）統合テスト
 *
 * 実際のテスト用DBに接続し、insertRoomNumber の以下を検証する:
 *   1. 正常登録で row が返ること
 *   2. 備考なしでも登録できること
 *   3. 重複ラベルで onConflictDoNothing → undefined が返ること
 *   4. 別施設なら同じラベルでも登録できること（テナント分離）
 *   5. 登録済みデータが DB に正しく保存されていること
 *
 * 実行: npx dotenv -e .env.test -- jest --config jest.integration.config.ts
 */
import { db } from "@/db";
import { users, roomNumbers, ROLE } from "@/db/schema";
import { insertRoomNumber } from "@/lib/repositories/roomNumbers/insertRoomNumber";

// ─── セットアップ / クリーンアップ ────────────────────────────────────────────
beforeAll(async () => {
    await db.delete(roomNumbers);
    await db.delete(users);

    await db.insert(users).values([
        {
            userId: "room-integ-user-1",
            passwordHash: "dummy",
            name: "部屋番号統合テスト太郎",
            role: ROLE.STAFF,
            facilityId: 1,
            phone: "090-2222-0001",
            hireDate: new Date("2024-01-01"),
        },
        {
            userId: "room-integ-user-2",
            passwordHash: "dummy",
            name: "部屋番号統合テスト花子",
            role: ROLE.STAFF,
            facilityId: 2,
            phone: "090-2222-0002",
            hireDate: new Date("2024-01-01"),
        },
    ]);
});

afterAll(async () => {
    await db.delete(roomNumbers);
    await db.delete(users);
    await db.$client.end();
});

beforeEach(async () => {
    await db.delete(roomNumbers);
});

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("insertRoomNumber 統合テスト", () => {

    describe("正常系", () => {
        it("正常登録: row が返り、id が付与される", async () => {
            const result = await insertRoomNumber(1, { label: "101号室" });

            expect(result).toBeDefined();
            expect(result!.id).toBeGreaterThan(0);
            expect(result!.label).toBe("101号室");
            expect(result!.facilityId).toBe(1);
        });

        it("備考なしでも登録できる", async () => {
            const result = await insertRoomNumber(1, { label: "102号室" });

            expect(result).toBeDefined();
            expect(result!.notes).toBeNull();
        });

        it("備考ありで登録できる", async () => {
            const result = await insertRoomNumber(1, { label: "103号室", notes: "角部屋" });

            expect(result).toBeDefined();
            expect(result!.notes).toBe("角部屋");
        });

        it("DBに正しく保存されている", async () => {
            await insertRoomNumber(1, { label: "201号室", notes: "南向き" });

            const [saved] = await db
                .select()
                .from(roomNumbers)
                .where(
                    (await import("drizzle-orm")).and(
                        (await import("drizzle-orm")).eq(roomNumbers.facilityId, 1),
                        (await import("drizzle-orm")).eq(roomNumbers.label, "201号室")
                    )
                );

            expect(saved.label).toBe("201号室");
            expect(saved.notes).toBe("南向き");
            expect(saved.residentName).toBeNull();
        });
    });

    describe("重複チェック（onConflictDoNothing）", () => {
        it("同じ施設・同じラベルで重複登録すると undefined が返る", async () => {
            await insertRoomNumber(1, { label: "301号室" });

            // 2回目は onConflictDoNothing で undefined
            const result = await insertRoomNumber(1, { label: "301号室" });

            expect(result).toBeUndefined();
        });

        it("重複登録してもDBのレコードは1件のまま", async () => {
            await insertRoomNumber(1, { label: "302号室" });
            await insertRoomNumber(1, { label: "302号室" });

            const { eq, and, count } = await import("drizzle-orm");
            const [{ value }] = await db
                .select({ value: count() })
                .from(roomNumbers)
                .where(
                    and(
                        eq(roomNumbers.facilityId, 1),
                        eq(roomNumbers.label, "302号室")
                    )
                );

            expect(Number(value)).toBe(1);
        });
    });

    describe("テナント分離", () => {
        it("別施設なら同じラベルでも両方登録できる", async () => {
            const r1 = await insertRoomNumber(1, { label: "101号室" });
            const r2 = await insertRoomNumber(2, { label: "101号室" });

            expect(r1).toBeDefined();
            expect(r2).toBeDefined();
            expect(r1!.id).not.toBe(r2!.id);
        });

        it("施設1のラベルは施設2のユニーク制約に影響しない", async () => {
            await insertRoomNumber(1, { label: "401号室" });

            // 施設2で同じラベルを登録 → 成功するはず
            const result = await insertRoomNumber(2, { label: "401号室" });
            expect(result).toBeDefined();
        });
    });
});

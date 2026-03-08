/**
 * 入居者名登録（insertResidentName）統合テスト
 *
 * 実際のテスト用DBに接続し、以下を検証する:
 *   1. 正常登録: residentName が更新されること
 *   2. 複数部屋を一括更新できること
 *   3. residentName を null（退去）に更新できること
 *   4. テナント分離: facilityId が違う部屋は更新されないこと
 *   5. selectExistingRoomIds: 施設のroomIdだけが返ること
 *   6. selectExistingRoomIds: 他施設のroomIdは含まれないこと
 *
 * 実行: npx dotenv -e .env.test -- jest --config jest.integration.config.ts
 */
import { db } from "@/db";
import { users, roomNumbers, ROLE } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
    insertResidentName,
    selectExistingRoomIds,
} from "@/lib/repositories/roomNumbers/insertResidentName";

// ─── テストデータ ID ──────────────────────────────────────────────────────────
let f1 = { roomId1: 0, roomId2: 0 };
let f2 = { roomId: 0 };

// ─── セットアップ / クリーンアップ ────────────────────────────────────────────
beforeAll(async () => {
    await db.delete(roomNumbers);
    await db.delete(users);

    await db.insert(users).values([
        {
            userId: "resident-integ-user-1",
            passwordHash: "dummy",
            name: "入居者統合テスト太郎",
            role: ROLE.STAFF,
            facilityId: 1,
            phone: "090-4444-0001",
            hireDate: new Date("2024-01-01"),
        },
        {
            userId: "resident-integ-user-2",
            passwordHash: "dummy",
            name: "入居者統合テスト花子",
            role: ROLE.STAFF,
            facilityId: 2,
            phone: "090-4444-0002",
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

    const [room1] = await db.insert(roomNumbers).values(
        { facilityId: 1, label: "R-101", residentName: null }
    ).returning({ id: roomNumbers.id });

    const [room2] = await db.insert(roomNumbers).values(
        { facilityId: 1, label: "R-102", residentName: null }
    ).returning({ id: roomNumbers.id });

    const [room3] = await db.insert(roomNumbers).values(
        { facilityId: 2, label: "R-201", residentName: null }
    ).returning({ id: roomNumbers.id });

    f1 = { roomId1: room1.id, roomId2: room2.id };
    f2 = { roomId: room3.id };
});

// ─── テスト ───────────────────────────────────────────────────────────────────
describe("insertResidentName 統合テスト", () => {

    describe("正常系", () => {
        it("1件の residentName を更新できる", async () => {
            await insertResidentName(1, [
                { roomId: f1.roomId1, residentName: "山田太郎" },
            ]);

            const [saved] = await db
                .select({ residentName: roomNumbers.residentName })
                .from(roomNumbers)
                .where(eq(roomNumbers.id, f1.roomId1));

            expect(saved.residentName).toBe("山田太郎");
        });

        it("複数部屋を一括更新できる", async () => {
            await insertResidentName(1, [
                { roomId: f1.roomId1, residentName: "山田太郎" },
                { roomId: f1.roomId2, residentName: "鈴木花子" },
            ]);

            const [r1] = await db
                .select({ residentName: roomNumbers.residentName })
                .from(roomNumbers)
                .where(eq(roomNumbers.id, f1.roomId1));

            const [r2] = await db
                .select({ residentName: roomNumbers.residentName })
                .from(roomNumbers)
                .where(eq(roomNumbers.id, f1.roomId2));

            expect(r1.residentName).toBe("山田太郎");
            expect(r2.residentName).toBe("鈴木花子");
        });

        it("residentName を null（退去）に更新できる", async () => {
            // まず名前を入れる
            await insertResidentName(1, [
                { roomId: f1.roomId1, residentName: "山田太郎" },
            ]);

            // nullに更新（退去）
            await insertResidentName(1, [
                { roomId: f1.roomId1, residentName: null },
            ]);

            const [saved] = await db
                .select({ residentName: roomNumbers.residentName })
                .from(roomNumbers)
                .where(eq(roomNumbers.id, f1.roomId1));

            expect(saved.residentName).toBeNull();
        });

        it("既存の residentName を別の名前に上書きできる", async () => {
            await insertResidentName(1, [
                { roomId: f1.roomId1, residentName: "山田太郎" },
            ]);
            await insertResidentName(1, [
                { roomId: f1.roomId1, residentName: "田中次郎" },
            ]);

            const [saved] = await db
                .select({ residentName: roomNumbers.residentName })
                .from(roomNumbers)
                .where(eq(roomNumbers.id, f1.roomId1));

            expect(saved.residentName).toBe("田中次郎");
        });
    });

    describe("テナント分離", () => {
        it("facilityId=1 で施設2の roomId を指定しても施設2の部屋は更新されない", async () => {
            // facilityId=1 で施設2の roomId を指定
            await insertResidentName(1, [
                { roomId: f2.roomId, residentName: "不正な入居者" },
            ]);

            const [saved] = await db
                .select({ residentName: roomNumbers.residentName })
                .from(roomNumbers)
                .where(eq(roomNumbers.id, f2.roomId));

            // 施設2の部屋は変わらない
            expect(saved.residentName).toBeNull();
        });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("selectExistingRoomIds 統合テスト", () => {

    it("施設1の roomId だけが返る", async () => {
        const result = await selectExistingRoomIds(1, [f1.roomId1, f1.roomId2]);

        const ids = result.map((r) => r.id);
        expect(ids).toContain(f1.roomId1);
        expect(ids).toContain(f1.roomId2);
        expect(ids).toHaveLength(2);
    });

    it("他施設の roomId は含まれない", async () => {
        const result = await selectExistingRoomIds(1, [f1.roomId1, f2.roomId]);

        const ids = result.map((r) => r.id);
        expect(ids).toContain(f1.roomId1);
        expect(ids).not.toContain(f2.roomId);
    });

    it("存在しない roomId は含まれない", async () => {
        const result = await selectExistingRoomIds(1, [999999]);
        expect(result).toHaveLength(0);
    });

    it("空配列は空配列を返す", async () => {
        const result = await selectExistingRoomIds(1, []);
        expect(result).toHaveLength(0);
    });
});

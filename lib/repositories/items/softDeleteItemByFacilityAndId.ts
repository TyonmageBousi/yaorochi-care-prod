import "server-only";

import { db } from "@/db/index";
import { items, ITEM_STATUS_FLAGS } from "@/db/schema"; // ここはあなたの定義場所に合わせて調整
import { and, eq, ne } from "drizzle-orm";

/**
 * items を論理削除する（status を DELETED にする）
 * - 成功: 更新した行を返す
 * - 対象なし / 既に削除済み: null
 */
export async function softDeleteItemByFacilityAndId(
    facilityId: number,
    itemId: number
) {
    const [row] = await db
        .update(items)
        .set({
            status: ITEM_STATUS_FLAGS.DELETED,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(items.facilityId, facilityId),
                eq(items.id, itemId),
                ne(items.status, ITEM_STATUS_FLAGS.DELETED) 
            )
        )
        .returning({
            id: items.id,
        });

    return row ?? null;
}

export type SoftDeleteItemByFacilityAndIdResult = Awaited<
    ReturnType<typeof softDeleteItemByFacilityAndId>
>;
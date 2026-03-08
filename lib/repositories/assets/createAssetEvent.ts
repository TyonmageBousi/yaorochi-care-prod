import { db } from "@/db/index";
import { assetEvents, assets } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { AssetEventRequest } from "@/lib/validations/assetEventSchema";
import { updateAssetService } from "@/lib/services/assetBoundApi/updateAssetService"

export async function createAssetEvent(
    data: AssetEventRequest,
    facilityId: number,
    performedBy: number
) {
    const row = await db.transaction(async (tx) => {
        await tx.execute(
            sql`select pg_advisory_xact_lock(${facilityId}, ${data.assetId})`
        );

        const [prev] = await tx
            .select({
                toStorageId: assetEvents.toStorageId,
                toRoomNumberId: assetEvents.toRoomNumberId,
            })
            .from(assetEvents)
            .where(
                and(
                    eq(assetEvents.facilityId, facilityId),
                    eq(assetEvents.assetId, data.assetId)
                )
            )
            .orderBy(desc(assetEvents.performedAt), desc(assetEvents.id))
            .limit(1)
            .execute();

        const fromStorageId = prev?.toStorageId ?? null;
        const fromRoomNumberId = prev?.toRoomNumberId ?? null;

        const [row] = await tx
            .insert(assetEvents)
            .values({
                facilityId,
                assetId: data.assetId,
                type: data.eventType,
                fromStorageId,
                fromRoomNumberId,
                toStorageId: data.toStorageId ?? null,
                toRoomNumberId: data.toRoomNumberId ?? null,
                performedBy,
                notes: data.notes ?? null,
            })
            .returning()
            .execute();

        // assets テーブルの現在状態を更新
        const updates = await updateAssetService(data);

        await tx
            .update(assets)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(assets.id, data.assetId))
            .execute();

        return row;
    });

    return row;
}

import "server-only";
import { db } from "@/db/index";
import { items } from "@/db/schema";
import { eq, and } from "drizzle-orm";


export async function findItemByFacilityAndId(facilityId: number, itemId: number) {
    const rows = await db
        .select({
            id: items.id,
            facilityId: items.facilityId,
            itemCode: items.itemCode,
            name: items.name,
            unit: items.unit,
            parLevel: items.parLevel,
            reorderPoint: items.reorderPoint,
            imageUrl: items.imageUrl,
            notes: items.notes,

        })
        .from(items)
        .where(and(eq(items.facilityId, facilityId), eq(items.id, itemId)))
        .limit(1);

    return rows[0] ?? null;
}

export type FindItemByFacilityAndIdResult = Awaited<ReturnType<typeof findItemByFacilityAndId>>;
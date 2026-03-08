import { db } from "@/db";
import { items } from "@/db/schema";
import { ConsumableItemRequest } from "@/lib/validations/item";
import { and, eq } from "drizzle-orm";


export async function updateItem(itemId: number, facilityId: number, item: ConsumableItemRequest, imageUrl?: string) {
    const [updated] = await db
        .update(items)
        .set({
            itemCode: item.itemCode,
            name: item.name,
            unit: item.unit,
            parLevel: item.parLevel ?? null,
            reorderPoint: item.reorderPoint ?? null,
            imageUrl: imageUrl ?? null,
            notes: item.notes ?? null,
            updatedAt: new Date(),
        })
        .where(and(
            eq(items.id, itemId),
            eq(items.facilityId, facilityId)
        ))
        .returning();

    return updated ?? null;
}
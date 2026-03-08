import { db } from "@/db";
import { items } from "@/db/schema";
import { ConsumableItemRequest } from "@/lib/validations/item";
import { BusinessValidationError } from "@/types/handleApiErrorType";

export async function createItem(newItem: ConsumableItemRequest, facilityId: number, imageUrl?: string) {
    const [row] = await db
        .insert(items)
        .values({
            facilityId,
            itemCode: newItem.itemCode,
            name: newItem.name,
            unit: newItem.unit,
            parLevel: newItem.parLevel ?? null,
            reorderPoint: newItem.reorderPoint ?? null,
            imageUrl: imageUrl ?? null,
            notes: newItem.notes ?? null,
        })
        .returning();

    if (!row) {
        throw new BusinessValidationError("消耗品の登録に失敗しました", 500, "SERVER_ERROR");
    }

    return row;
}
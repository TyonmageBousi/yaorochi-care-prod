import { db } from "@/db";
import { items } from "@/db/schema";
import { and, eq, not } from "drizzle-orm";

export async function findExistsItemCode(
    facilityId: number,
    itemCode: string,
    itemId?: number
): Promise<boolean> {

    const conditions = [
        eq(items.facilityId, facilityId),
        eq(items.itemCode, itemCode),
    ];

    if (itemId) {
        conditions.push(not(eq(items.id, itemId)));
    }

    const existingItem = await db.query.items.findFirst({
        where: and(...conditions),
    });

    return existingItem !== undefined;
}
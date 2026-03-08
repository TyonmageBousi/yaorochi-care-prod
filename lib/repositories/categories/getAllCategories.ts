import "server-only";
import { db } from "@/db/index";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllCategories(facilityId: number) {
    return db
        .select({
            id: categories.id,
            label: categories.label,
        })
        .from(categories)
        .where(eq(categories.facilityId, facilityId))
        .orderBy(asc(categories.label));
}

export type Categories = Awaited<ReturnType<typeof getAllCategories>>[number];
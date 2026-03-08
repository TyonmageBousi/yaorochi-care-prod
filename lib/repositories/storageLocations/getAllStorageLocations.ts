import "server-only";
import { db } from "@/db/index";
import { storageLocations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllStorageLocations(facilityId: number) {
    return db
        .select({
            id: storageLocations.id,
            label: storageLocations.label,
        })
        .from(storageLocations)
        .where(eq(storageLocations.facilityId, facilityId))
        .orderBy(asc(storageLocations.label));
}

export type StorageLocationOption = Awaited<ReturnType<typeof getAllStorageLocations>>[number];
import { db } from "@/db";
import { roomNumbers } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { ResidentRowRequest } from "@/lib/validations/residentRegister";

export async function selectExistingRoomIds(facilityId: number, roomIds: number[]) {
    if (roomIds.length === 0) return [];

    return db
        .select({ id: roomNumbers.id })
        .from(roomNumbers)
        .where(
            and(
                eq(roomNumbers.facilityId, facilityId),
                inArray(roomNumbers.id, roomIds)
            )
        );
}

export async function insertResidentName(facilityId: number, newResidentNames: ResidentRowRequest[]) {
    await db.transaction(async (tx) => {
        for (const newResidentName of newResidentNames) {
            await tx
                .update(roomNumbers)
                .set({
                    residentName: newResidentName.residentName ?? null,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq(roomNumbers.id, newResidentName.roomId),
                        eq(roomNumbers.facilityId, facilityId)
                    )
                );
        }
    });
}
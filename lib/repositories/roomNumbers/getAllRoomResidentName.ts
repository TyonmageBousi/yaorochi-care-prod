import "server-only";

import { db } from "@/db/index";
import { roomNumbers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getAllRoomResidentName(
    facilityId: number
) {
    return db
        .select({
            id: roomNumbers.id,
            label: roomNumbers.label,
            residentName: roomNumbers.residentName
        })
        .from(roomNumbers)
        .where(eq(roomNumbers.facilityId, facilityId))
        .orderBy(asc(roomNumbers.label));
}

export type RoomResidentName = Awaited<ReturnType<typeof getAllRoomResidentName>>[number];

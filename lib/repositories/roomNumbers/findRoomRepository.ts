// src/lib/repositories/roomRepository.ts
import { db } from "@/db";
import { roomNumbers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function findRoom(facilityId: number, roomId: number) {
    const [room] = await db
        .select({
            id: roomNumbers.id,
            label: roomNumbers.label,
            residentName: roomNumbers.residentName,
        })
        .from(roomNumbers)
        .where(and(eq(roomNumbers.id, roomId), eq(roomNumbers.facilityId, facilityId)))
        .limit(1);

    return room ?? null;
}

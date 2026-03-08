import { db } from "@/db";
import { roomNumbers } from "@/db/schema";
import { RoomNumberFormValue } from "@/lib/validations/roomNumber";

export async function insertRoomNumber(facilityId: number, newRoomNumber: RoomNumberFormValue) {

    const [row] = await db
        .insert(roomNumbers)
        .values({
            facilityId,
            label: newRoomNumber.label,
            residentName: null,
            notes: newRoomNumber.notes ?? null,
        })
        .onConflictDoNothing({
            target: [roomNumbers.facilityId, roomNumbers.label],
        })
        .returning();
        
    return row

}
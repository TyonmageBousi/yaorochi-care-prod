import { db } from "@/db";
import { sql } from "drizzle-orm";
import { findRoom } from "@/lib/repositories/roomNumbers/findRoomRepository";
import { insertOutBoundTransactions } from "@/lib/repositories/items/insertOutBound";
import { validateMasterData, validateStock } from "@/lib/services/outBoundApi/outBoundValidation";
import { BusinessValidationError } from "../../../types/handleApiErrorType";
import { OutBoundRequest } from "@/lib/validations/outBound";

export async function processOutbound(data: OutBoundRequest, facilityId: number, userId: number): Promise<void> {
    const room = await findRoom(facilityId, data.roomId);
    if (!room) {
        throw new BusinessValidationError(
            "入力内容を確認してください",
            422,
            "VALIDATION_ERROR",
            { roomId: ["部屋番号が見つかりません"] }
        );
    }

    const masterValidationErrors = await validateMasterData(facilityId, data.rows);
    if (Object.keys(masterValidationErrors).length) {
        throw new BusinessValidationError(
            "入力内容を確認してください",
            422,
            "VALIDATION_ERROR",
            masterValidationErrors
        );
    }

    await db.transaction(async (tx) => {
        const itemIdsToLock = [...new Set(data.rows.map(r => r.itemId))].sort((a, b) => a - b);

        for (const itemId of itemIdsToLock) {
            await tx.execute(sql`select pg_advisory_xact_lock(${facilityId}, ${itemId})`);
        }

        const stockValidationErrors = await validateStock(facilityId, data.rows);
        if (Object.keys(stockValidationErrors).length) {
            throw new BusinessValidationError(
                "在庫が不足しています",
                422,
                "VALIDATION_ERROR",
                stockValidationErrors
            );
        }

        await insertOutBoundTransactions(tx, facilityId, userId, room.residentName, data.rows);
    });
}
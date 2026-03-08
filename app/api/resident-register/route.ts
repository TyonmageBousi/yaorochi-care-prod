import { NextRequest, NextResponse } from "next/server";
import { residentRequestSchema } from "@/lib/validations/residentRegister";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors"
import { selectExistingRoomIds, insertResidentName } from "@/lib/repositories/roomNumbers/insertResidentName"
import { handleApiError } from "@/lib/services/common/handleApiError"
import { requireUser } from "@/lib/services/auth/requireUser"

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const user = await requireUser();

        // バリデーション（string の roomId を number に coerce）
        const body = await request.json();
        const validation = residentRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", message: 'バリデーションエラー', details: buildFieldErrors(validation.error.issues) },
                { status: 400 }
            );
        }

        // 部屋の存在確認（N+1回避のため inArray でまとめて取得）
        const rows = validation.data.rows;
        const roomIds = rows.map(row => row.roomId);

        const existingRooms = await selectExistingRoomIds(user.facilityId, roomIds);
        const existingRoomIds = new Set(existingRooms.map(existingRoom => existingRoom.id));

        const details: Record<string, string[]> = {};
        rows.forEach((row, i) => {
            if (!existingRoomIds.has(row.roomId)) {
                details[`rows.${i}.roomId`] = [`部屋ID ${row.roomId} が見つかりません`];
            }
        });

        if (Object.keys(details).length > 0) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", message: "バリデーションエラー", details },
                { status: 400 }
            );
        }

        // 入居者名の一括登録
        await insertResidentName(user.facilityId, rows);

        return NextResponse.json(
            { success: true, message: `${rows.length}件の入居者名を登録しました` },
            { status: 200 }
        );

    } catch (error) {
        return handleApiError(error);
    }
}
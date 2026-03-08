import { NextRequest, NextResponse } from "next/server";
import { roomNumberFormSchema } from "@/lib/validations/roomNumber";
import { insertRoomNumber } from "@/lib/repositories/roomNumbers/insertRoomNumber"
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors"
import { handleApiError } from "@/lib/services/common/handleApiError"
import { requireUser } from "@/lib/services/auth/requireUser"

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const user = await requireUser();

        // バリデーション
        const body = await request.json();
        const validation = roomNumberFormSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", details: buildFieldErrors(validation.error.issues) },
                { status: 400 }
            );
        }

        const row = await insertRoomNumber(user.facilityId, validation.data);

        if (!row) {
            return NextResponse.json(
                { success: false, code: "ALREADY_EXISTS", message: "同じ部屋番号が既に存在しています" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: true, message: "部屋番号を登録しました" },
            { status: 201 }
        );

    } catch (error) {
        return handleApiError(error);
    }
}
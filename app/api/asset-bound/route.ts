import { NextResponse } from "next/server";
import { assetEventRequestSchema } from "@/lib/validations/assetEventSchema";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors"
import { createAssetEvent } from "@/lib/repositories/assets/createAssetEvent"
import { handleApiError } from "@/lib/services/common/handleApiError"
import { requireUser } from "@/lib/services/auth/requireUser"

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        // 認証チェック
        const user = await requireUser();

        // バリデーション
        const body = await req.json();
        const validation = assetEventRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    code: "VALIDATION",
                    message: 'バリデーションエラー',
                    details: buildFieldErrors(validation.error.issues),
                },
                { status: 400 }
            );
        }

        // イベント登録
        const row = await createAssetEvent(validation.data, user.facilityId, user.id);

        return NextResponse.json(
            { success: true, result: row },
            { status: 201 }
        );

    } catch (error) {
        return handleApiError(error);
    }
}
import { NextRequest, NextResponse } from "next/server";
import { inBoundRequestSchema } from "@/lib/validations/inBound";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { processInbound } from "@/lib/services/inBoundApi/inBoundService";
import { requireUser } from "@/lib/services/auth/requireUser"

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const user = await requireUser();

        // バリデーション
        const data = await request.json();
        const result = inBoundRequestSchema.safeParse(data);

        if (!result.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", details: buildFieldErrors(result.error.issues) },
                { status: 400 }
            );
        }

        // 入庫処理
        const count = await processInbound(result.data, user.facilityId, user.id);

        return NextResponse.json(
            { success: true, message: "入庫を記録しました", result: { count } },
            { status: 201 }
        );

    } catch (error) {
        return handleApiError(error);
    }
}
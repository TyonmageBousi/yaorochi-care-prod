import { NextRequest, NextResponse } from "next/server";
import { outboundRequestSchema } from "@/lib/validations/outBound";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors";
import { processOutbound } from "@/lib/services/outBoundApi/outBoundService";
import { handleApiError } from "@/lib/services/common/handleApiError"
import { requireUser } from "@/lib/services/auth/requireUser"

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const user = await requireUser();

        // バリデーション
        const body = await request.json();
        const validated = outboundRequestSchema.safeParse(body);

        if (!validated.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", details: buildFieldErrors(validated.error.issues) },
                { status: 400 }
            );
        }

        // 払出処理
        await processOutbound(validated.data, user.facilityId, user.id);

        return NextResponse.json(
            { success: true, message: "払出を記録しました" },
            { status: 201 }
        );

    } catch (error) {
        return handleApiError(error);
    }
}
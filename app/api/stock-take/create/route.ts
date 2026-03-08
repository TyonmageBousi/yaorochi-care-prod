import { NextRequest, NextResponse } from "next/server";
import { stockTakeFormSchema } from "@/lib/validations/stock-takes/stockTakes";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { createStockTakeLine } from "@/lib/repositories/stockTakes/createStockTakeLine";
import { requireUser } from "@/lib/services/auth/requireUser";
import { findExistStockTake } from "@/lib/repositories/stockTakes/findExistStockTake"
export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const user = await requireUser();

        // バリデーション
        const body = await request.json();
        const validated = stockTakeFormSchema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", details: buildFieldErrors(validated.error.issues) },
                { status: 400 }
            );
        }

        const storageId = Number(validated.data.storageId);

        const existStockTake = await findExistStockTake(storageId, user.facilityId);

        if (existStockTake) {
            return NextResponse.json(
                {
                    success: false,
                    code: "DUPLICATE_IN_PROGRESS",
                    message: "同じ保管場所に進行中の棚卸があります",
                    existStockTake: existStockTake,
                },
                { status: 409 }
            );
        }

        // ── 新規棚卸作成 ──
        const stockTakeId = await createStockTakeLine({
            facilityId: user.facilityId,
            storageId,
            notes: validated.data.notes,
            userId: user.id,
        });

        return NextResponse.json(
            { success: true, message: "保存しました", result: { stockTakeId } }
        );

    } catch (error) {
        return handleApiError(error);
    }
}
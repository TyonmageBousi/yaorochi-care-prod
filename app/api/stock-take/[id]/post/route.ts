import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { confirmStockTake } from "@/lib/repositories/stockTakes/confirmStockTake";
import { requireUser } from "@/lib/services/auth/requireUser"

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 認証チェック
        const user = await requireUser();

        // IDバリデーション
        const { id } = await params;
        const stockTakeId = Number(id);

        if (!Number.isFinite(stockTakeId)) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "不正な棚卸IDです" },
                { status: 400 }
            );
        }

        // 棚卸確定
        await confirmStockTake(stockTakeId, user.facilityId);

        return NextResponse.json({ success: true, message: "棚卸を確定しました" });

    } catch (error) {
        return handleApiError(error);
    }
}
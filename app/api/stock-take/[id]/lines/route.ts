import { NextRequest, NextResponse } from "next/server";
import { updateStockTakeLines } from "@/lib/repositories/stockTakes/updateStockTakeLines";
import { stockTakeCountSchema } from "@/lib/validations/stock-takes/stockTakeCountSchema";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors";
import { handleApiError } from "@/lib/services/common/handleApiError"
import { requireUser } from "@/lib/services/auth/requireUser"

export async function POST(
  request: NextRequest,
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
        { success: false, code: "NOT_FOUND", message: "指定の棚卸場所が見つかりませんでした。" },
        { status: 400 }
      );
    }

    // バリデーション
    const body = await request.json();
    const validated = stockTakeCountSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, code: "VALIDATION", details: buildFieldErrors(validated.error.issues) },
        { status: 400 }
      );
    }

    // 棚卸明細の保存
    await updateStockTakeLines({ stockTakeId, facilityId: user.facilityId, lines: validated.data.lines });

    return NextResponse.json({
      success: true,
      message: "保存しました",
      result: { stockTakeId }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
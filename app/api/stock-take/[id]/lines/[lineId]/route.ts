import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stockTakeLines, stockTakes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { requireUser } from "@/lib/services/auth/requireUser";
import { BusinessValidationError } from "@/types/handleApiErrorType";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineId: string }> }
) {
  try {
    // 認証チェック
    const user = await requireUser();

    // IDバリデーション
    const { id, lineId: lineIdParam } = await params;
    const stockTakeId = Number(id);
    const lineId = Number(lineIdParam);

    if (!Number.isFinite(stockTakeId) || !Number.isFinite(lineId)) {
      return NextResponse.json(
        { success: false, code: "INVALID_ARGUMENT", message: "不正なIDです" },
        { status: 400 }
      );
    }

    // 棚卸明細の削除
    await db.transaction(async (tx) => {
      // 棚卸セッションの存在確認・施設IDの一致確認
      const [stockTake] = await tx
        .select({ id: stockTakes.id })
        .from(stockTakes)
        .where(
          and(
            eq(stockTakes.id, stockTakeId),
            eq(stockTakes.facilityId, user.facilityId)
          )
        );

      if (!stockTake) {
        throw new BusinessValidationError("棚卸が見つかりません", 404, "NOT_FOUND");
      }

      const result = await tx
        .delete(stockTakeLines)
        .where(
          and(
            eq(stockTakeLines.id, lineId),
            eq(stockTakeLines.stockTakeId, stockTake.id)
          )
        )
        .returning({ id: stockTakeLines.id });

      if (result.length === 0) {
        throw new BusinessValidationError("削除する明細が見つかりません", 404, "NOT_FOUND");
      }
    });

    return NextResponse.json({ success: true, message: "削除しました" });

  } catch (error) {
    return handleApiError(error);
  }
}
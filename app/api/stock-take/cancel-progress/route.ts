// app/api/stock-take/cancel-progress/route.ts

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/services/auth/requireUser";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { db } from "@/db/index";
import { stockTakes, STOCKTAKE_STATUS } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const user = await requireUser();
        const body = await request.json();
        const stockTakeId = Number(body.stockTakeId);

        if (!Number.isFinite(stockTakeId) || stockTakeId < 1) {
            return NextResponse.json(
                { success: false, code: "INVALID_ARGUMENT", message: "不正なIDです" },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(stockTakes)
            .set({
                status: STOCKTAKE_STATUS.CANCELED,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(stockTakes.id, stockTakeId),
                    eq(stockTakes.facilityId, user.facilityId),
                    eq(stockTakes.status, STOCKTAKE_STATUS.IN_PROGRESS)
                )
            )
            .returning({ id: stockTakes.id })
            .execute();

        if (!updated) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "対象の棚卸が見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "棚卸をキャンセルしました",
        });
    } catch (error) {
        return handleApiError(error);
    }
}
import { NextRequest, NextResponse } from "next/server";
import { deleteStorage } from "@/storage/storage";
import { softDeleteItemByFacilityAndId } from "@/lib/repositories/items/softDeleteItemByFacilityAndId";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { findItemByFacilityAndId } from "@/lib/repositories/items/findItemByFacilityAndId";
import { requireUser } from "@/lib/services/auth/requireUser";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const user = await requireUser();

        const { id } = await params;  
        const itemId = Number(id);

        
        if (!Number.isFinite(itemId) || itemId < 1) {
            return NextResponse.json(
                { success: false, code: "INVALID_ARGUMENT", message: "不正なIDです" },
                { status: 400 }
            );
        }

        const item = await findItemByFacilityAndId(user.facilityId, itemId);
        if (!item) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "削除対象が見つかりません。" },
                { status: 404 }
            );
        }

        const result = await softDeleteItemByFacilityAndId(user.facilityId, itemId);
        if (!result) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "削除対象が見つかりません。" },
                { status: 404 }
            );
        }

        //画像削除は best-effort（失敗で削除自体を失敗にしない）
        if (item.imageUrl) {
            try {
                await deleteStorage(item.imageUrl);
            } catch(error) {
                console.error("deleteStorage failed", { itemId, imageUrl: item.imageUrl, error });
            }
        }

        return NextResponse.json({
            success: true,
            message: "消耗品を削除しました",
        });
    } catch (error) {
        return handleApiError(error);
    }
}
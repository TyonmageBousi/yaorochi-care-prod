import { NextRequest, NextResponse } from "next/server";
import { insertStorage, deleteStorage } from "@/storage/storage";
import { consumableItemRequestSchema } from "@/lib/validations/item";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { updateItem } from "@/lib/repositories/items/updateItem";
import { requireUser } from "@/lib/services/auth/requireUser"
import { findExistsItemCode } from "@/lib/repositories/items/findExistsItemCode";
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 認証チェック
        const user = await requireUser();


        // IDバリデーション
        const { id } = await params;
        const itemId = Number(id);

        if (!Number.isFinite(itemId) || itemId < 1) {
            return NextResponse.json(
                { success: false, code: "INVALID_ARGUMENT", message: "不正なIDです" },
                { status: 400 }
            );
        }

        // バリデーション
        const formData = await request.formData();
        const data = {
            itemCode: formData.get("itemCode"),
            name: formData.get("name"),
            unit: formData.get("unit"),
            storageId: formData.get("parLevel"),
            owner: formData.get("reorderPoint"),
            status: formData.get("storageId"),
            roomNumberId: formData.get("initialQty"),
            notes: formData.get("notes"),
            image: formData.get("image") instanceof File ? formData.get("image") : undefined,
            imageUrl: formData.get("imageUrl"),
        };


        const validation = consumableItemRequestSchema.safeParse(data);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", details: buildFieldErrors(validation.error.issues) },
                { status: 400 }
            );
        }

        const updatedItem = validation.data;

        
const exitAssetCode = await findExistsItemCode(user.facilityId, updatedItem.itemCode, itemId)

        if (exitAssetCode) {
            return NextResponse.json({
                success: false,
                code: "VALIDATION",
                message: "既存の資産コードを同一になっております。"
            }, { status: 400 });
        }




        // 既存画像の削除 → 新規画像のアップロード
        if (updatedItem.image && updatedItem.imageUrl) {
            await deleteStorage(updatedItem.imageUrl);
        }
        const imageUrl = updatedItem.image ? await insertStorage(updatedItem.image) : undefined;

        // 消耗品更新
        const updated = await updateItem(itemId, user.facilityId, updatedItem, imageUrl);

        if (!updated) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "対象が見つからないか、更新権限がありません。" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "消耗品を更新しました",
        });

    } catch (error) {
        return handleApiError(error);
    }
}
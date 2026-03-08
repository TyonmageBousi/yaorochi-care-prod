import { NextRequest, NextResponse } from "next/server";
import { careAssetRequestSchema } from "@/lib/validations/asset"
import { updateAsset } from "@/lib/repositories/assets/updateAsset"
import { insertStorage, deleteStorage } from "@/storage/storage"
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors"
import { handleApiError } from "@/lib/services/common/handleApiError"
import { requireUser } from "@/lib/services/auth/requireUser"
import { findExistsAssetCode } from "@/lib/repositories/assets/findExistsAssetCode"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 認証チェック
        const user = await requireUser();

        // IDバリデーション
        const { id } = await params;
        const assetId = Number(id);

        if (!Number.isFinite(assetId) || assetId < 1) {
            return NextResponse.json(
                { success: false, code: "INVALID_ARGUMENT", message: "不正なIDです" },
                { status: 400 }
            );
        }

        // バリデーション
        const formData = await request.formData();
        const data = {
            assetCode: formData.get("assetCode"),
            name: formData.get("name"),
            categoryId: formData.get("categoryId"),
            storageId: formData.get("storageId"),
            owner: formData.get("owner"),
            status: formData.get("status"),
            roomNumberId: formData.get("roomNumberId"),
            notes: formData.get("notes"),
            image: formData.get("image") instanceof File ? formData.get("image") : undefined,
            imageUrl: formData.get("imageUrl"),
        };

        const validation = careAssetRequestSchema.safeParse(formData);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", details: buildFieldErrors(validation.error.issues) },
                { status: 400 }
            );
        }

        const updatedAsset = validation.data;

        const exitAssetCode = await findExistsAssetCode(user.facilityId, updatedAsset.assetCode, assetId)

        if (exitAssetCode) {
            return NextResponse.json({
                success: false,
                code: "VALIDATION",
                message: "既存の資産コードを同一になっております。"
            }, { status: 400 });
        }

        // 既存画像の削除 → 新規画像のアップロード
        if (updatedAsset.image && updatedAsset.imageUrl) {
            await deleteStorage(updatedAsset.imageUrl);
        }
        const imageUrl = updatedAsset.image ? await insertStorage(updatedAsset.image) : undefined;

        await updateAsset(assetId, user.facilityId, updatedAsset, imageUrl);

        return NextResponse.json({
            success: true,
            message: "介護用品を更新しました",
        });

    } catch (error) {
        return handleApiError(error);
    }
}
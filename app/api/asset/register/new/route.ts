import { NextRequest, NextResponse } from "next/server";
import { insertStorage } from "@/storage/storage"
import { careAssetRequestSchema } from "@/lib/validations/asset"
import { createAsset } from "@/lib/repositories/assets/createAsset"
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors"
import { handleApiError } from "@/lib/services/common/handleApiError"
import { requireUser } from "@/lib/services/auth/requireUser"
import { findExistsAssetCode } from "@/lib/repositories/assets/findExistsAssetCode"

export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const user = await requireUser();

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

        const validation = careAssetRequestSchema.safeParse(data);

        if (!validation.success) {
            return NextResponse.json({
                success: false,
                code: "VALIDATION",
                details: buildFieldErrors(validation.error.issues)
            }, { status: 400 });
        }

        const newAsset = validation.data;

        const exitAssetCode = await findExistsAssetCode(user.facilityId, newAsset.assetCode)

        if (exitAssetCode) {
            return NextResponse.json({
                success: false,
                code: "VALIDATION",
                message: "既存の資産コードを同一になっております。"
            }, { status: 400 });
        }

        // 画像アップロード → 資産登録
        const imagePath = newAsset.image ? await insertStorage(newAsset.image) : undefined;

        console.log("umgUrl", imagePath);

        await createAsset(newAsset, user.facilityId, imagePath);

        return NextResponse.json({
            success: true,
            message: "介護用品を登録しました",
        });

    } catch (error) {
        return handleApiError(error);
    }
}
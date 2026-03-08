import { NextRequest, NextResponse } from "next/server";
import { deleteStorage } from "@/storage/storage";
import { softDeleteAssetByFacilityAndId } from "@/lib/repositories/assets/softDeleteAssetByFacilityAndId";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { getAsset } from "@/lib/repositories/assets/getAsset";
import { requireUser } from "@/lib/services/auth/requireUser";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireUser();

        const { id } = await params;

        const assetId = Number(id);

        if (!Number.isFinite(assetId) || assetId < 1) {
            return NextResponse.json(
                { success: false, code: "INVALID_ARGUMENT", message: "不正なIDです" },
                { status: 400 }
            );
        }


        const asset = await getAsset(user.facilityId, assetId);


        if (!asset) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "削除対象が見つかりません。" },
                { status: 404 }
            );
        }

        const result = await softDeleteAssetByFacilityAndId(user.facilityId, assetId);



        if (!result) {
            return NextResponse.json(
                { success: false, code: "NOT_FOUND", message: "削除対象が見つかりません。" },
                { status: 404 }
            );
        }

        if (asset.imageUrl) {
            try {
                await deleteStorage(asset.imageUrl);
            } catch (error) {
                console.error("deleteStorage failed", { assetId, imageUrl: asset.imageUrl, error });
            }
        }

        return NextResponse.json({
            success: true,
            message: "資産を削除しました",
        });
    } catch (error) {
        return handleApiError(error);
    }
}
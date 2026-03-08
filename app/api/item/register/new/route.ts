import { NextRequest, NextResponse } from "next/server";
import { insertStorage } from "@/storage/storage";
import { consumableItemRequestSchema } from "@/lib/validations/item";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors"
import { handleApiError } from "@/lib/services/common/handleApiError"
import { createItem } from "@/lib/repositories/items/createItem"
import { requireUser } from "@/lib/services/auth/requireUser"
import { findExistsItemCode } from "@/lib/repositories/items/findExistsItemCode";

export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const user = await requireUser();

        // バリデーション
        const formData = await request.formData();

         const data = {
            itemCode: formData.get("itemCode"),
            name: formData.get("name"),
            unit: formData.get("unit"),
            parLevel: formData.get("parLevel"),
            reorderPoint: formData.get("reorderPoint"),
            storageId: formData.get("storageId"),
            initialQty: formData.get("initialQty"),
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

        const newItem = validation.data;

        const existItemCode = await findExistsItemCode(user.facilityId, newItem.itemCode)

        if (existItemCode) {
            return NextResponse.json({
                success: false,
                code: "VALIDATION",
                message: "消耗品コードが同一になっております。"
            }, { status: 400 });
        }



        // 画像アップロード → 消耗品登録
        const imageUrl = newItem.image ? await insertStorage(newItem.image) : undefined;
        await createItem(newItem, user.facilityId, imageUrl);

        return NextResponse.json({
            success: true,
            message: "消耗品を登録しました",
        });

    } catch (error) {
        return handleApiError(error);
    }
}
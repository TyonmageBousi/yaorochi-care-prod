import { NextResponse } from "next/server";
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { handleApiError } from "@/lib/services/common/handleApiError";
import { requireUser } from "@/lib/services/auth/requireUser";

export async function GET() {
  try {
    // 認証チェック
    const user = await requireUser();

    // 保管場所一覧取得
    const storages = await getAllStorageLocations(user.facilityId);

    return NextResponse.json({
      success: true,
       message: "取得に成功しました。",
      result: storages,
    });

  } catch (error) {
    return handleApiError(error);
  }
}
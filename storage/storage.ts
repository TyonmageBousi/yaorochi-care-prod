import { supabase, STORAGE_BUCKET } from "@/storage/index";
import { BusinessValidationError } from "@/types/handleApiErrorType";

const STORAGE_PREFIX = "images";

function buildFileName(file: File): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).slice(2, 10);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    return `${STORAGE_PREFIX}/${timestamp}-${randomStr}.${ext}`;
}

function extractPathFromUrl(url: string): string {
    const { pathname } = new URL(url);
    // /storage/v1/object/public/bucket-name/images/xxx.png → images/xxx.png
    const marker = `${STORAGE_BUCKET}/`;
    return pathname.slice(pathname.indexOf(marker) + marker.length);
}

export async function insertStorage(file: File): Promise<string> {
    const objectPath = buildFileName(file);

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(objectPath, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
        });


    if (error) {
        console.error("upload error:", error);
        throw new BusinessValidationError("画像アップロードに失敗しました", 500, "UPLOAD_ERROR");
    }

    const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

export async function deleteStorage(imageUrl: string): Promise<void> {
    const path = extractPathFromUrl(imageUrl);

    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

    if (error) {
        console.error("delete error:", error);
        throw new BusinessValidationError("画像の削除に失敗しました", 500, "DELETE_ERROR");
    }
}
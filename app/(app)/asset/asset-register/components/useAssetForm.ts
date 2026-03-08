'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { careAssetFormSchema, type CareAssetValues } from "@/lib/validations/asset";
import { OWNER_TYPE_STR, ASSET_STATUS_STR } from "@/lib/validations/asset";
import { RadioOption } from "@/components/form/RadioForm";
import { useImageUpload } from "@/components/useImageUpload";
import { handleApiResponse } from "@/lib/services/handleApiResponse";

export type CareAssetFormProps = {
    storageLocations: RadioOption[];
    roomNumbers: RadioOption[];
    categories: RadioOption[];
    defaultData?: Partial<CareAssetValues>;
    assetId?: number;
};

export function useAssetForm({
    storageLocations,
    roomNumbers,
    categories,
    defaultData,
    assetId,
}: CareAssetFormProps) {
    const router = useRouter();

    const {
        register, handleSubmit, setValue, watch, setError,
        formState: { errors, isValid, isSubmitting },
    } = useForm<CareAssetValues>({
        resolver: zodResolver(careAssetFormSchema),
        mode: 'onChange',
        defaultValues: {
            assetCode: defaultData?.assetCode ?? "",
            name: defaultData?.name ?? "",
            categoryId: defaultData?.categoryId ?? "",
            storageId: defaultData?.storageId ?? "",
            owner: defaultData?.owner ?? OWNER_TYPE_STR.FACILITY,
            status: defaultData?.status ?? ASSET_STATUS_STR.IN_USE,
            roomNumberId: defaultData?.roomNumberId ?? undefined,
            notes: defaultData?.notes ?? "",
        },
    });

    const {
        imagePreview, imageFile, existingImageUrl, fileInputRef,
        onImageChange, onRemoveImage, onRemoveExistingImage,
    } = useImageUpload<CareAssetValues>(defaultData?.imageUrl, setValue);

    const owner = watch("owner");

    // 施設所有に切り替えたら部屋番号をリセット
    const handleOwnerChange = (value: string) => {
        if (value === OWNER_TYPE_STR.FACILITY) {
            setValue("roomNumberId", undefined);
        }
    };

    // FormDataを組み立ててAPIに送信
    const onSubmit = handleSubmit(async (data: CareAssetValues) => {
        try {
            const formData = new FormData();
            formData.append("assetCode", data.assetCode);
            formData.append("name", data.name);
            formData.append("categoryId", data.categoryId.toString());
            formData.append("storageId", data.storageId.toString());
            formData.append("owner", data.owner.toString());
            formData.append("status", data.status.toString());
            if (data.roomNumberId) formData.append("roomNumberId", data.roomNumberId.toString());
            if (data.notes) formData.append("notes", data.notes);
            if (imageFile) formData.append("image", imageFile);

            // 新規 or 編集でURLを切り替え
            const url = assetId ? `/api/asset/register/${assetId}` : '/api/asset/register/new';
            const res = await fetch(url, { method: 'POST', body: formData });

            const result = await handleApiResponse<CareAssetValues>(res, setError);

            if (result === false) return

            toast.success(result.message ?? "保存しました")
            router.push('/asset/asset-inventory');

        } catch (error) {
            toast.error(error instanceof Error ? error.message : '登録に失敗しました');
        }
    });
    const handleBack = () => router.push('/dashboard');

    return {
        // 状態
        owner,
        isValid,
        isSubmitting,
        imagePreview,
        existingImageUrl,
        storageLocations,
        roomNumbers,
        categories,
        // フォーム
        register, errors, fileInputRef,
        // ハンドラ
        onSubmit,
        onOwnerChange: handleOwnerChange,
        onImageChange,
        onRemoveImage,
        onRemoveExistingImage,
        handleBack
    };
}
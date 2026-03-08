'use client';
import { useMemo, useCallback } from "react";
import { itemFormSchema, type ItemValues } from "@/lib/validations/item";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { RadioOption } from "@/components/form/RadioForm";
import { units } from "@/lib/constants/unitType"
import { useImageUpload } from "@/components/useImageUpload";
import { handleApiResponse } from "@/lib/services/handleApiResponse";

export type ItemFormProps = {
    defaultData?: Partial<ItemValues>;
    itemId?: number
};

export function useItemFormLogic({
    defaultData,
    itemId
}: ItemFormProps) {

    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors, isValid, isSubmitting },
    } = useForm<ItemValues>({
        resolver: zodResolver(itemFormSchema),
        mode: "onChange",
        defaultValues: {
            itemCode: defaultData?.itemCode ?? "",
            name: defaultData?.name ?? "",
            unit: defaultData?.unit ?? undefined,
            parLevel: defaultData?.parLevel ?? undefined,
            reorderPoint: defaultData?.reorderPoint ?? undefined,
            notes: defaultData?.notes ?? "",
            image: undefined,
        },
    });

    // 画像関連は useAssetImage に委譲
    const {
        imagePreview,
        imageFile,
        existingImageUrl,
        fileInputRef,
        onImageChange,
        onRemoveImage,
        onRemoveExistingImage,
    } = useImageUpload<ItemValues>(defaultData?.imageUrl, setValue);

    const unitOptions = useMemo<RadioOption[]>(() => units, []);

    const onSubmit = handleSubmit(async (data: ItemValues) => {
        try {
            const formData = new FormData();
            formData.append("itemCode", data.itemCode);
            formData.append("name", data.name);
            formData.append("unit", String(data.unit));
            if (data.parLevel != null) formData.append("parLevel", String(data.parLevel));
            if (data.reorderPoint != null) formData.append("reorderPoint", String(data.reorderPoint));
            if (data.notes) formData.append("notes", data.notes);
            if (imageFile) formData.append("image", imageFile);
            if (data.storageId != null) formData.append("storageId", String(data.storageId));
            if (data.initialQty != null) formData.append("initialQty", String(data.initialQty));


            const url = itemId ? `/api/item/register/${itemId}` : '/api/item/register/new';
            const res = await fetch(url, { method: 'POST', body: formData });


            const result = await handleApiResponse<ItemValues>(res, setError);

            if (result === false) return

            toast.success(result.message ?? "消耗品を登録しました")
            router.push("/item/item-inventory");

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "登録に失敗しました");
        }
    });
    const handleBack = () => router.push('/dashboard');

    return {
        // 状態
        imagePreview,
        isValid,
        isSubmitting,
        existingImageUrl,
        unitOptions,
        // フォーム
        register,
        errors,
        fileInputRef,
        // ハンドラ
        onSubmit,
        onImageChange,
        onRemoveImage,
        onRemoveExistingImage,
        handleBack
    };
}
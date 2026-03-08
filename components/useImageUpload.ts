'use client';
import { useState, useRef } from "react";
import { UseFormSetValue, FieldValues, Path } from "react-hook-form";

export function useImageUpload<T extends FieldValues>(
    defaultImageUrl: string | null | undefined,
    setValue: UseFormSetValue<T>
) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(defaultImageUrl ?? null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
        setImageFile(file);
        setValue('image' as Path<T>, file as any);
    };

    const onRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setValue('image' as Path<T>, undefined as any);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onRemoveExistingImage = () => {
        setExistingImageUrl(null);
        onRemoveImage();
    };

    return {
        // 状態
        imagePreview,
        imageFile,
        existingImageUrl,
        fileInputRef,

        // ハンドラ
        onImageChange: handleImageChange,
        onRemoveImage,
        onRemoveExistingImage,
    };
}
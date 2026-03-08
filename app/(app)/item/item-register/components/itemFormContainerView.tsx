'use client';
import ItemInfoSection from "./itemInfoFormView";
import ItemRegisterImageUploadView from "@/components/ImageUploadView";
import { useItemFormLogic, type ItemFormProps } from "@/app/(app)/item/item-register/components/useItemFormLogic";
import SubmitButton from "@/components/SubmitButton"

export default function itemFormContainerView(props: ItemFormProps) {
    const {
        // 状態
        isSubmitting,
        imagePreview,
        existingImageUrl,
        unitOptions,
        isValid,
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
    } = useItemFormLogic(props);


    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-6">
            <div className="max-w-4xl mx-auto px-5 py-6">

                {/* ページヘッダー */}
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 shadow-lg">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-sm opacity-90">スタッフ用</p>
                        <h1 className="text-2xl font-bold mt-1">消耗品（おむつ等）の新規登録</h1>
                        <p className="text-sm mt-2 opacity-95">品目を登録し、初期在庫を入庫（台帳）に記録します</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 mt-5">
                    <form onSubmit={onSubmit} className="space-y-4">

                        {/* 品目情報 */}
                        <ItemInfoSection
                            register={register}
                            errors={errors}
                            unitOptions={unitOptions}
                        />

                        {/* 画像アップロード */}
                        <ItemRegisterImageUploadView
                            imagePreview={imagePreview}
                            existingImageUrl={existingImageUrl}
                            onImageChange={onImageChange}
                            onRemoveImage={onRemoveImage}
                            onRemoveExistingImage={onRemoveExistingImage}
                            fileInputRef={fileInputRef}
                        />
                        <SubmitButton isFormValid={isValid} isSubmitting={isSubmitting} onBack={handleBack} />
                    </form>
                    <div className="h-4" />
                </div>

            </div>
        </div>
    );
}
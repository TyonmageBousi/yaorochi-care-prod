'use client';

import { useAssetForm, type CareAssetFormProps } from "./useAssetForm";
import AssetRegisterFormView from "./AssetRegisterFormView";
import AssetRadioFormView from "./AssetRadioFormView";
import AssetRegisterImageUploadView from "@/components/ImageUploadView";
import SubmitButton from "@/components/SubmitButton"

export default function CareAssetFormView(props: CareAssetFormProps) {
    const {
        // 状態
        owner,
        isSubmitting,
        isValid,
        imagePreview, existingImageUrl,
        storageLocations, roomNumbers, categories,
        // フォーム
        register, errors,
        fileInputRef,
        // ハンドラ
        onSubmit, onOwnerChange,
        onImageChange, onRemoveImage, onRemoveExistingImage, handleBack
    } = useAssetForm(props);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-6">
            <div className="max-w-4xl mx-auto px-5 py-6">

                <div className="rounded-2xl  bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 shadow-lg">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-sm opacity-90">スタッフ用</p>
                        <h1 className="text-2xl font-bold mt-1">介護用品の新規登録</h1>
                        <p className="text-sm mt-2 opacity-95">新しい介護用品を在庫に追加します</p>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-4 mt-5">
                    <form onSubmit={onSubmit} className="space-y-4">

                        {/* 基本情報（名前・コードなど） */}
                        <AssetRegisterFormView register={register} errors={errors} />

                        {/* ラジオ選択（カテゴリ・保存場所・ステータス・所有者・部屋番号） */}
                        <AssetRadioFormView
                            register={register}
                            errors={errors}
                            owner={owner}
                            onOwnerChange={onOwnerChange}
                            storageLocations={storageLocations}
                            roomNumbers={roomNumbers}
                            categories={categories}
                        />

                        {/* 画像アップロード */}
                        <AssetRegisterImageUploadView
                            imagePreview={imagePreview}
                            existingImageUrl={existingImageUrl}
                            onImageChange={onImageChange}
                            onRemoveImage={onRemoveImage}
                            onRemoveExistingImage={onRemoveExistingImage}
                            fileInputRef={fileInputRef}
                        />

                        {/* 送信ボタン */}
                        <SubmitButton isFormValid={isValid} isSubmitting={isSubmitting} onBack={handleBack} />
                    </form>
                    <div className="h-4" />
                </div>
            </div>

        </div>
    );
}
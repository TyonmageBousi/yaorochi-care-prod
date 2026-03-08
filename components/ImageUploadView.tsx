'use client';

import { X, Image as ImageIcon } from "lucide-react";

type Props = {
    imagePreview: string | null;
    existingImageUrl: string | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
    onRemoveExistingImage: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
};

export default function ImageUploadView({
    imagePreview,
    existingImageUrl,
    onImageChange,
    onRemoveImage,
    onRemoveExistingImage,
    fileInputRef,
}: Props) {
    const displayUrl = imagePreview ?? existingImageUrl;
    const isNew = !!imagePreview;

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <p className="text-red-500 text-sm">
                ※個人情報が分かるものは絶対に保存しないでください
            </p>
            <p className="text-gray-500 text-sm">
                ※アップロードできる画像は5MB以下です
            </p>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChange}
                accept="image/*"
                className="hidden"
            />

            {displayUrl ? (
                <div className="space-y-3">
                    <div className="relative w-full">
                        <img
                            src={displayUrl}
                            alt="プレビュー"
                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                            type="button"
                            onClick={isNew ? onRemoveImage : onRemoveExistingImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                            title={isNew ? "新規画像を取り消す" : "既存画像を削除"}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500">
                            {isNew ? "新規画像（未保存）" : "既存画像"}
                        </span>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors"
                            >
                                差し替える
                            </button>
                            {isNew && (
                                <button
                                    type="button"
                                    onClick={onRemoveImage}
                                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                                >
                                    新規を取り消す
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-orange-400 hover:bg-orange-50 transition-all"
                >
                    <div className="flex flex-col items-center gap-2 text-gray-600">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-orange-500" />
                        </div>
                        <p className="font-semibold">画像をアップロード</p>
                        <p className="text-sm">クリックして画像を選択</p>
                    </div>
                </button>
            )}
        </div>
    );
}

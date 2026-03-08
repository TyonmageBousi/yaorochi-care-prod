'use client';

import { useAssetBoundLogic, type AssetEventFormProps } from '@/app/(app)/asset/asset-bound/components/useAssetBoundLogic';
import AssetBoundSearchView from './AssetBoundSearchView';
import AssetBoundSelectView from './AssetBoundSelectView';
import AssetBoundEventFormView from './AssetBoundEventFormView';
import SubmitButton from "@/components/SubmitButton";

export default function AssetEventFormView(props: AssetEventFormProps) {
  const {
    selectedAsset, selectedEventType, isSubmitting, isValid,
    filteredAssets, needsDestination, needsRoom, handleBack,
    register, fieldErrors, storageOptions, roomOptions,
    searchName, searchCode,
    onSelectAsset, onSelectEventType, onSubmit,
    onChangeSearchName, onChangeSearchCode, onClearSearch,
  } = useAssetBoundLogic(props);

  return (
    // ページ全体：薄いオレンジのグラデーション背景
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">

      {/* 中央寄せ・横幅制限・余白 */}
      <div className="max-w-4xl mx-auto px-5 py-6">

        {/* ヘッダー：オレンジのグラデーションバー */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-white">資産イベント登録</h1>
            <p className="text-orange-100 text-sm mt-0.5">資産の移動・変更を記録します</p>
          </div>
        </div>

        {/* フォーム本体 */}
        <form onSubmit={onSubmit} className="max-w-5xl mx-auto px-4 py-6">

          {/* 検索バー */}
          <AssetBoundSearchView
            searchCode={searchCode}
            searchName={searchName}
            resultCount={filteredAssets.length}
            onChangeSearchCode={onChangeSearchCode}
            onChangeSearchName={onChangeSearchName}
            onClearSearch={onClearSearch}
          />

          {/* 2カラムレイアウト（スマホは縦並び、PCは横並び） */}
          <div className="flex flex-col md:flex-row gap-5 items-start">

            {/* 左カラム：資産リスト */}
            <div className="w-full md:w-1/2">
              <AssetBoundSelectView
                filteredAssets={filteredAssets}
                selectedAsset={selectedAsset}
                isLoadingAssets={false}
                onSelectAsset={onSelectAsset}
              />
            </div>

            {/* 右カラム：イベント種別・移動先・備考 */}
            <div className="w-full md:w-1/2">
              <AssetBoundEventFormView
                selectedEventType={selectedEventType}
                needsDestination={needsDestination}
                needsRoom={needsRoom}
                storageOptions={storageOptions}
                roomOptions={roomOptions}
                register={register}
                fieldErrors={fieldErrors}
                onSelectEventType={onSelectEventType}
              />
            </div>

          </div>

          {/* 送信・戻るボタン */}
          <div className="mt-6">
            <SubmitButton isFormValid={isValid} isSubmitting={isSubmitting} onBack={handleBack} />
          </div>

          {/* ボタン下の余白（スクロール時に隠れないように） */}
          <div className="h-16" />

        </form>
      </div>
    </div>
  );
}
'use client';

import { ListAssetsResult } from '@/lib/repositories/assets/getAllAssets';
import { AssetOption } from '@/app/(app)/asset/asset-bound/components/useAssetBoundLogic';

interface AssetListProps {
  filteredAssets: ListAssetsResult;
  selectedAsset: AssetOption | null;
  isLoadingAssets: boolean;
  onSelectAsset: (assetId: number) => void;
}

// 資産サムネイル：画像があれば表示、なければアイコン
function AssetThumbnail({ imageUrl, name, size }: { imageUrl: string | null; name: string; size: string }) {
  return (
    <div className={`${size} flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center`}>
      {imageUrl
        ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        : <i className="fas fa-box text-orange-300 text-sm" />
      }
    </div>
  );
}

export default function AssetBoundSelectView({
  filteredAssets,
  selectedAsset,
  isLoadingAssets,
  onSelectAsset,
}: AssetListProps) {
  return (
    <div className="flex flex-col gap-4">

      {/* 資産リスト */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100">
        <div className="px-4 pt-4 pb-2 border-b border-orange-100">
          <h2 className="text-sm font-semibold text-gray-700">対象資産</h2>
        </div>

        {/* スクロール対象（max-h-80 = 320px） */}
        <div className="overflow-y-auto max-h-80 divide-y divide-orange-50">

          {/* 読み込み中 */}
          {isLoadingAssets && (
            <div className="flex items-center justify-center gap-2 py-10 text-orange-300">
              <i className="fas fa-spinner fa-spin" />
              <span className="text-sm text-gray-400">読み込み中...</span>
            </div>
          )}

          {/* 該当なし */}
          {!isLoadingAssets && filteredAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-gray-400">
              <i className="fas fa-box-open text-2xl text-orange-200" />
              <span className="text-sm">資産が見つかりません</span>
            </div>
          )}

          {/* 資産一覧 */}
          {!isLoadingAssets && filteredAssets.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelectAsset(asset.id)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors hover:bg-orange-50 ${selectedAsset?.id === asset.id ? 'bg-orange-50' : ''
                }`}
            >
              <AssetThumbnail imageUrl={asset.imageUrl} name={asset.name} size="w-10 h-10" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{asset.name}</p>
                <p className="text-xs text-gray-400 truncate">{asset.assetCode}</p>
              </div>
              {/* ステータスバッジ */}
              <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${asset.status === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                {asset.status === 1 ? '使用中' : 'その他'}
              </span>
            </button>
          ))}

        </div>
      </div>

      {/* 選択中の資産 */}
      {selectedAsset && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-orange-500 mb-3 flex items-center gap-1.5">
            <i className="fas fa-check-circle" />
            選択中の資産
          </p>
          <div className="flex items-center gap-3">
            <AssetThumbnail imageUrl={selectedAsset.imageUrl} name={selectedAsset.name} size="w-12 h-12" />
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">{selectedAsset.name}</p>
              <p className="text-xs text-gray-500 truncate">{selectedAsset.assetCode}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
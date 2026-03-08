"use client";

import { useRouter } from "next/navigation";
import { ProgressStockTake } from "@/lib/repositories/stockTakes/findExistStockTake";
import { StorageLocationOption } from "@/lib/repositories/storageLocations/getAllStorageLocations";
type Props = {
  stockTake: ProgressStockTake;
  storages: StorageLocationOption[]
  onClose: () => void;
  onRestart: () => void
};

export default function ResumeStockTakeModal({ stockTake, storages, onClose, onRestart }: Props) {
  const router = useRouter();
  const storageLabel = storages.find(s => s.id === stockTake?.storageId)?.label ?? "不明";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* 背景オーバーレイ（クリックで閉じる） */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold text-base">進行中の棚卸があります</h2>
              <p className="text-orange-100 text-xs">再開しますか？</p>
            </div>
          </div>
        </div>

        {/* 棚卸情報 */}
        <div className="px-5 py-4 space-y-3">
          <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-orange-700">保管場所</span>
              <span className="text-sm font-bold text-gray-800">{storageLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-orange-700">開始日時</span>
              <span className="text-sm text-gray-600">
                {new Date(stockTake.startedAt).toLocaleString("ja-JP")}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">
            「再開する」を押すと前回の棚卸に戻ります
          </p>
        </div>

        {/* 操作ボタン */}
        <div className="px-5 pb-5 space-y-2">
          <button
            type="button"
            onClick={() => router.push(`/stock-take/stock-taking/?id=${stockTake.id}`)}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl hover:shadow-lg active:scale-[0.98] transition-all"
          >
            再開する
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full bg-gray-100 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            新規で作成する
          </button>
        </div>

      </div>
    </div>
  );
}
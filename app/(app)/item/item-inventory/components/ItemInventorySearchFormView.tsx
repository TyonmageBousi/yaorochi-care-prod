'use client';

import { X } from "lucide-react";
import { GetItemResult } from "@/lib/repositories/items/getAllItemInventory";

type Props = {
  search: string;
  statusFilter: "all" | "active" | "inactive";
  filtered: GetItemResult[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  onClose: () => void;
  onReset: () => void;
};

const closeButtonStyle = "p-2 hover:bg-white/20 rounded-lg transition-colors";
const clearButtonStyle = "flex-1 px-6 py-4 text-lg border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all font-bold bg-white shadow-md";
const searchButtonStyle = "flex-1 px-6 py-4 text-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg active:scale-[0.98] transition-all font-bold shadow-md";
const filterActiveStyle = "bg-orange-500 text-white";
const filterInactiveStyle = "bg-gray-100 text-gray-500 hover:bg-gray-200";

export default function ItemInventorySearchFormView({
  search,
  statusFilter,
  filtered,
  onSearchChange,
  onStatusFilterChange,
  onClose,
  onReset,
}: Props) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-4">

          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">検索条件</h3>
                <p className="text-sm mt-1 opacity-90">条件を入力して検索</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={closeButtonStyle}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 品名・SKU検索 */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <label className="block text-base font-bold text-gray-800 mb-3">品名・品物コード</label>
            <input
              type="text"
              placeholder="品名・品物コードで検索..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
            />
          </div>

          {/* ステータスフィルター */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <label className="block text-base font-bold text-gray-800 mb-3">ステータス</label>
            <div className="flex gap-2">
              {([["all", "すべて"], ["active", "有効のみ"], ["inactive", "無効のみ"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onStatusFilterChange(val)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${statusFilter === val ? filterActiveStyle : filterInactiveStyle}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-2 sticky bottom-4">
            <button
              type="button"
              onClick={onReset}
              className={clearButtonStyle}
            >
              クリア
            </button>
            <button
              type="button"
              onClick={onClose}
              className={searchButtonStyle}
            >
              検索する（{filtered.length}件）
            </button>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
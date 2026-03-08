'use client';

import { useCallback } from "react";
import { useItemInventory } from "./useItemInventory";
import ItemInventorySearchFormView from "./ItemInventorySearchFormView";
import ItemInventoryListView from "./ItemInventoryListView";
import ItemInventoryDeleteView from "./ItemInventoryDeleteView";
import { GetItemResult } from "@/lib/repositories/items/getAllItemInventory";

type Props = {
  allItems: GetItemResult[];
};

const searchButtonStyle = "w-full bg-white rounded-2xl shadow-md border-2 border-orange-200 p-5 hover:border-orange-400 hover:shadow-lg active:scale-[0.98] transition-all text-left font-bold text-gray-800";

export default function ItemInventoryContainerView({ allItems }: Props) {
  const {
    // 状態
    isSearchOpen,
    search,
    statusFilter,
    filtered,
    hasActiveFilters,
    deleteTarget,
    // ハンドラ
    setIsSearchOpen,
    onSearchChange,
    onStatusFilterChange,
    onDeleteTargetChange,
    handleReset,
    handleDeleteConfirm,
  } = useItemInventory(allItems);

  const onOpenSearch = useCallback(() => setIsSearchOpen(true), [setIsSearchOpen]);
  const onCloseSearch = useCallback(() => setIsSearchOpen(false), [setIsSearchOpen]);
  const onCancelDelete = useCallback(() => onDeleteTargetChange(null), [onDeleteTargetChange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-6">
      <div className="max-w-4xl mx-auto px-5 py-6">

        {/* ページヘッダー */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm opacity-90">スタッフ用</p>
            <h1 className="text-2xl font-bold mt-1">在庫一覧</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-5 space-y-4">

          {/* 検索条件ボタン */}
          <button
            type="button"
            onClick={onOpenSearch}
            className={searchButtonStyle}
          >
            🔍 {hasActiveFilters ? "絞り込み中" : "検索条件を設定"}
          </button>

          {/* 在庫リスト */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <ItemInventoryListView
              filtered={filtered}
              onDeleteClick={onDeleteTargetChange}
            />
          </div>

        </div>

        {/* 検索フォームモーダル */}
        {isSearchOpen && (
          <ItemInventorySearchFormView
            search={search}
            statusFilter={statusFilter}
            filtered={filtered}
            onSearchChange={onSearchChange}
            onStatusFilterChange={onStatusFilterChange}
            onClose={onCloseSearch}
            onReset={handleReset}
          />
        )}

        {/* 削除確認モーダル */}
        <ItemInventoryDeleteView
          deleteTarget={deleteTarget}
          onCancel={onCancelDelete}
          onConfirm={handleDeleteConfirm}
        />

      </div>
    </div>
  );
}
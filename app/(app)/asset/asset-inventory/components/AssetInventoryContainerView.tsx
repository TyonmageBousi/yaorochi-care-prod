"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useInventorySearch } from "./useAssetInventory";
import { StorageLocationOption } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { RoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import { AssetListRow } from "@/lib/repositories/assets/getAllAssets";
import { Categories } from "@/lib/repositories/categories/getAllCategories";
import AssetInventorySearchFormView from "./AssetInventorySearchFormView";
import AssetListView from "./AssetListView";
import AssetInventoryDeleteView from "./AssetInventoryDeleteView";
import { owners } from "@/lib/constants/asset";

type Props = {
    storageLocations: StorageLocationOption[];
    roomNumbers: RoomNumbers[];
    assets: AssetListRow[];
    categories: Categories[];
};

export default function AssetInventoryContainer({ storageLocations, roomNumbers, assets, categories }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<AssetListRow | null>(null);

    const {
        // 状態
        assetList, totalCount, currentPage, totalPages,
        isSearchOpen, setIsSearchOpen, hasActiveFilters,

        // フィルター
        name, categoryIds, storageIds, ownerIds, roomNumberIds,

        // ハンドラ
        nextPage, prevPage,
        onNameChange, onCategoryChange, onStorageChange, onOwnerChange, onRoomNumberChange,
        onReset,
        handleConfirmDelete,
    } = useInventorySearch({ defaultAssets: assets });

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-6">
            <div className="max-w-4xl mx-auto px-5 py-6">
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 shadow-lg">
                    <div className="max-w-6xl mx-auto">
                        <p className="text-sm opacity-90">スタッフ用</p>
                        <h1 className="text-2xl font-bold mt-1">商品在庫検索</h1>
                        <p className="text-sm mt-2 opacity-95">必要な商品を素早く見つけましょう</p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 mt-5 space-y-4">
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="w-full bg-white rounded-2xl shadow-md border-2 border-orange-200 p-5 hover:border-orange-400 hover:shadow-lg active:scale-[0.98] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center">
                                <Search className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h2 className="text-lg font-bold text-gray-800">検索条件を設定</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {hasActiveFilters ? "絞り込み中" : "商品名・カテゴリ・保管場所"}
                                </p>
                            </div>
                            <div className={`transform transition-transform ${isSearchOpen ? "rotate-180" : ""}`}>
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </button>

                    {isSearchOpen && (
                        <AssetInventorySearchFormView
                            name={name}
                            categoryIds={categoryIds}
                            storageIds={storageIds}
                            ownerIds={ownerIds}
                            roomNumberIds={roomNumberIds}
                            categories={categories}
                            storageLocations={storageLocations}
                            owners={owners}
                            roomNumbers={roomNumbers}
                            resultCount={totalCount}
                            onNameChange={onNameChange}
                            onCategoryChange={onCategoryChange}
                            onStorageChange={onStorageChange}
                            onOwnerChange={onOwnerChange}
                            onRoomNumberChange={onRoomNumberChange}
                            onClose={() => setIsSearchOpen(false)}
                            onReset={onReset}
                            onSearch={() => setIsSearchOpen(false)}
                        />
                    )}

                    <AssetListView
                        assetList={assetList}
                        roomNumbers={roomNumbers}
                        totalCount={totalCount}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        nextPage={nextPage}
                        prevPage={prevPage}
                        onDeleteClick={setDeleteTarget}
                    />

                    <div className="h-2" />
                </div>
            </div>

            <AssetInventoryDeleteView
                deleteTarget={deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleConfirmDelete(deleteTarget)}
            />
        </div>
    );
}

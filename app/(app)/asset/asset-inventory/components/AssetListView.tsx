"use client";

import { useRouter } from "next/navigation";
import { AssetListRow } from "@/lib/repositories/assets/getAllAssets";
import { RoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import { OWNER_TYPE } from "@/db/schema";
import { owners } from "@/lib/constants/asset"

type Props = {
    assetList: AssetListRow[];
    roomNumbers: RoomNumbers[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    nextPage: () => void;
    prevPage: () => void;
    onDeleteClick: (asset: AssetListRow) => void;
};

export default function AssetListView({
    assetList, roomNumbers, totalCount, currentPage, totalPages, nextPage, prevPage, onDeleteClick,
}: Props) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="text-gray-800 font-bold">
                    検索結果: {totalCount} 件
                    {totalPages > 0 && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            (ページ {currentPage} / {totalPages})
                        </span>
                    )}
                </div>
            </div>

            {assetList.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">検索結果がありません</p>
                    <p className="text-sm mt-2">条件を変更して再度検索してください</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {assetList.map((asset) => (
                            <div key={asset.id} className="p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0">
                                        <img
                                            src={asset.imageUrl || "https://placehold.co/100x100/gray/white?text=No+Image"}
                                            alt={asset.name}
                                            className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div className="font-bold text-gray-800 text-lg">{asset.name}</div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/asset/asset-register/${asset.id}`)}
                                                    className="px-3 py-1 text-sm bg-orange-50 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-100 transition-all"
                                                >
                                                    編集
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDeleteClick(asset)}
                                                    className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-all"
                                                >
                                                    削除
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <span className="text-sm text-gray-600">
                                                所有者: <span className={`font-semibold px-2 py-0.5 rounded ${asset.owner === OWNER_TYPE.RENTAL ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                                                    {owners.find((owner) => owner.id === asset.owner)?.label}                                                </span>
                                            </span>
                                            {asset.owner === OWNER_TYPE.RENTAL && asset.roomNumberId && (
                                                <span className="text-sm text-gray-600">
                                                    部屋番号: <span className="font-semibold text-purple-600">
                                                        {roomNumbers.find(r => r.id === asset.roomNumberId)?.label || "-"}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                            <button type="button" onClick={prevPage} disabled={currentPage === 1}
                                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-orange-400 hover:bg-orange-50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
                                ← 前へ
                            </button>
                            <span className="text-gray-600 font-medium">{currentPage} / {totalPages}</span>
                            <button type="button" onClick={nextPage} disabled={currentPage === totalPages}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
                                次へ →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

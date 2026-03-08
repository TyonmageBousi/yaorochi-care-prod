'use client';

import { Edit, Trash2 } from "lucide-react";
import { getStockLevel } from "./useItemInventory";
import ItemStockBadgeView from "./ItemStockBadgeView";
import { GetItemResult } from "@/lib/repositories/items/getAllItemInventory";
import { units } from "@/lib/constants/unitType"

type Props = {
  filtered: GetItemResult[];
  onDeleteClick: (item: GetItemResult) => void;
};

const itemCardStyle = "p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all";
const editButtonStyle = "px-3 py-1 text-sm bg-orange-50 text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-100 transition-all";
const deleteButtonStyle = "px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-all";

function getStockCls(level: ReturnType<typeof getStockLevel>) {
  if (level === "critical") return "text-red-600 bg-red-50";
  if (level === "low") return "text-amber-600 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
}

function ItemThumbnail({ item }: { item: GetItemResult }) {
  return (
    <div className="flex-shrink-0">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-16 h-16 rounded-xl object-cover border border-gray-100"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
          No Image
        </div>
      )}
    </div>
  );
}

export default function ItemInventoryListView({ filtered, onDeleteClick }: Props) {
  if (filtered.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">検索結果がありません</p>
        <p className="text-sm mt-2">条件を変更して再度検索してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-5">
      {filtered.map(item => {
        const level = getStockLevel(item);
        const stockCls = getStockCls(level);

        return (
          <div key={item.id} className={itemCardStyle}>
            <div className="flex gap-4">

              {/* サムネイル */}
              <ItemThumbnail item={item} />

              <div className="flex-1 min-w-0">

                {/* 商品名・SKU・アクションボタン */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">品物コード: {item.itemCode}</p>
                  </div>
                  {/* 更新ボタン */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <a href={`/item/item-register/${item.id}`} className={editButtonStyle}>
                      編集
                    </a>
                    {/* 削除ボタン */}
                    <button
                      type="button"
                      onClick={() => onDeleteClick(item)}
                      className={deleteButtonStyle}
                    >
                      削除
                    </button>
                  </div>
                </div>

                {/* 在庫数・ステータスバッジ */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-sm px-2.5 py-0.5 rounded-full font-bold ${stockCls}`}>
                    {item.currentStock} {units.find((u) => u.id === item.unit)?.label}                  </span>
                  <ItemStockBadgeView item={item} />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 1 ? "bg-slate-100 text-slate-500" : "bg-slate-200 text-slate-400"}`}>
                    {item.status === 1 ? "有効" : "無効"}
                  </span>
                </div>

                {/* Par・発注点・メモ */}
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
                  {item.parLevel !== null && (
                    <span className="text-xs text-slate-400">
                      <span className="font-medium text-slate-500">Par:</span> {item.parLevel} {item.unit}
                    </span>
                  )}
                  {item.reorderPoint !== null && (
                    <span className="text-xs text-slate-400">
                      <span className="font-medium text-slate-500">発注点:</span> {item.reorderPoint} {item.unit}
                    </span>
                  )}
                  {item.notes && (
                    <span className="text-xs text-slate-400 italic truncate max-w-[200px]" title={item.notes}>
                      {item.notes}
                    </span>
                  )}
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
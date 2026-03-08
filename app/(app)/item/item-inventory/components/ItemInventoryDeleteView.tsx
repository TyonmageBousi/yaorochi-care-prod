'use client';

import { Trash2 } from "lucide-react";
import { GetItemResult } from "@/lib/repositories/items/getAllItemInventory";

type Props = {
  deleteTarget: GetItemResult | null;
  onCancel: () => void;
  onConfirm: () => void;
};

const cancelButtonStyle = "flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";
const confirmButtonStyle = "flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 active:scale-95 transition-all";

export default function ItemInventoryDeleteView({ deleteTarget, onCancel, onConfirm }: Props) {
  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">

      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* 削除確認ダイアログ */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">

        {/* アイコン */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>

        {/* メッセージ */}
        <h3 className="text-center text-lg font-bold text-slate-800 mb-1">アイテムを削除</h3>
        <p className="text-center text-sm text-slate-500 mb-6">
          <span className="font-medium text-slate-700">「{deleteTarget.name}」</span> を削除します。<br />
          この操作は取り消せません。
        </p>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cancelButtonStyle}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={confirmButtonStyle}
          >
            削除する
          </button>
        </div>

      </div>
    </div>
  );
}
'use client';

import { useState } from "react";
import { ItemHistoryTable } from "./ItemHistoryTable";
import { AssetHistoryTable } from "./AssetHistoryTable";
import { AssetHistoryRow } from "@/lib/repositories/assets/getAssetHistory";
import { ItemHistoryRow } from "@/lib/repositories/items/getItemHistory";

type TabBtnProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};


// ── タブボタン ────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: TabBtnProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-5 py-2 text-sm font-semibold rounded-xl transition-all",
        active
          ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
          : "text-stone-500 hover:text-stone-800 hover:bg-white/60",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

type Props = {
  assetsHistory: AssetHistoryRow[];
  itemsHistory: ItemHistoryRow[];
};

// ── HistoryPage ───────────────────────────────────────────────
export function HistoryPage({ assetsHistory, itemsHistory }: Props) {
  const [tab, setTab] = useState("items"); // "items" | "assets"

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-5 py-6">

        {/* ヘッダー */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 pt-6 pb-4 shadow-md shadow-orange-200">
          <h1 className="text-white text-lg font-bold tracking-tight">変更履歴</h1>
        </div>
        {/* コンテンツ */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-4">

          {/* タブ */}
          <div className="rounded-2xl bg-white/70 backdrop-blur rounded-2xl p-1.5 shadow-sm ring-1 ring-stone-200 inline-flex gap-1">
            <TabBtn active={tab === "items"} onClick={() => setTab("items")}>消耗品</TabBtn>
            <TabBtn active={tab === "assets"} onClick={() => setTab("assets")}>資産</TabBtn>
          </div>

          {/* テーブル切り替え */}
          {tab === "items"
            ? <ItemHistoryTable rows={itemsHistory} />
            : <AssetHistoryTable rows={assetsHistory} />
          }
        </div>
      </div>
    </div>
  );
}

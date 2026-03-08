'use client';

import { useState, useMemo } from "react";
import { StockTxType, STOCK_TX_TYPE } from "@/db/schema";
import { ItemHistoryRow } from "@/lib/repositories/items/getItemHistory";
import { units } from "@/lib/constants/unitType"

function itemTypeMeta(type: StockTxType) {
  return ({
    [STOCK_TX_TYPE.IN]: { label: "入庫", color: "bg-emerald-100 text-emerald-700" },
    [STOCK_TX_TYPE.OUT]: { label: "払出", color: "bg-orange-100 text-orange-700" },
    [STOCK_TX_TYPE.WASTE]: { label: "廃棄", color: "bg-red-100 text-red-700" },
    [STOCK_TX_TYPE.ADJUST]: { label: "調整", color: "bg-amber-100 text-amber-700" },
    [STOCK_TX_TYPE.STOCKTAKE]: { label: "棚卸", color: "bg-purple-100 text-purple-700" },
  })[type] ?? { label: "不明", color: "bg-gray-100 text-gray-500" };
}

const fmtQty = (qty: number) => (qty > 0 ? `+${qty}` : `${qty}`);

type Props = {
  rows: ItemHistoryRow[];
};

export function ItemHistoryTable({ rows = [] }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim();
    if (!query) return rows;
    return rows.filter((row) =>
      row.itemName.includes(query) ||
      row.itemCode.includes(query) ||
      (row.createdBy ?? "").includes(query)
    );
  }, [rows, search]);

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-stone-100">
        <p className="text-sm font-bold text-stone-700">消耗品</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="商品名・コード・登録者で検索…"
            className="text-sm bg-stone-50 rounded-lg border border-stone-200 px-3 py-1.5 text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-300 w-56"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
              クリア
            </button>
          )}
          <span className="text-xs text-stone-400 whitespace-nowrap">{filtered.length}件</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-stone-300 text-sm">該当データがありません</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">商品名</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">コード</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">区分</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider">数量</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">登録者</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">日付</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const meta = itemTypeMeta(r.type as StockTxType);
                return (
                  <tr key={r.txId} className={`border-b border-stone-100 hover:bg-orange-50/50 transition-colors ${i % 2 === 1 ? "bg-stone-50/40" : ""}`}>
                    <td className="px-4 py-3 text-sm font-semibold text-stone-800">
                      {r.itemName}
                      <span className="text-stone-400 font-normal text-xs ml-1.5">{units.find((u) => u.id === r.unit)?.label}</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-xs text-stone-500">{r.itemCode}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-bold text-base tabular-nums ${r.qty < 0 ? "text-red-500" : "text-emerald-600"}`}>
                      {fmtQty(r.qty)}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">{r.createdBy ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs text-stone-400">
                      {r.performedAt.toLocaleString("ja-JP")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
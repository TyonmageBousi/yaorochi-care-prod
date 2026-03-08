'use client';

import { useState, useMemo } from "react";
import { AssetEventType, ASSET_EVENT_TYPE } from "@/db/schema";
import { AssetHistoryRow } from "@/lib/repositories/assets/getAssetHistory";

function assetEventMeta(type: AssetEventType) {
  return ({
    [ASSET_EVENT_TYPE.CREATE]: { label: "作成", color: "bg-stone-100 text-stone-600" },
    [ASSET_EVENT_TYPE.MOVE]: { label: "移動", color: "bg-amber-100 text-amber-700" },
    [ASSET_EVENT_TYPE.ASSIGN_ROOM]: { label: "居室割当", color: "bg-indigo-100 text-indigo-700" },
    [ASSET_EVENT_TYPE.UNASSIGN_ROOM]: { label: "居室解除", color: "bg-stone-100 text-stone-600" },
    [ASSET_EVENT_TYPE.MAINTENANCE]: { label: "メンテ", color: "bg-amber-100 text-amber-700" },
    [ASSET_EVENT_TYPE.REPAIR]: { label: "修理", color: "bg-red-100 text-red-700" },
    [ASSET_EVENT_TYPE.RETIRE]: { label: "廃棄", color: "bg-zinc-100 text-zinc-600" },
  })[type] ?? { label: "不明", color: "bg-gray-100 text-gray-500" };
}

type Props = {
  rows: AssetHistoryRow[];
};

export function AssetHistoryTable({ rows = [] }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim();
    if (!query) return rows;
    return rows.filter((row) =>
      row.assetName.includes(query) ||
      row.assetCode.includes(query) ||
      (row.createdBy ?? "").includes(query) ||
      (row.roomNumber ?? "").includes(query)
    );
  }, [rows, search]);

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-stone-100 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-stone-100">
        <p className="text-sm font-bold text-stone-700">資産履歴</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="資産名・コード・部屋・登録者で検索…"
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
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">資産名</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">資産コード</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">区分</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">部屋</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">登録者</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">日付</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const meta = assetEventMeta(r.type);
                return (
                  <tr key={r.eventId} className={`border-b border-stone-100 hover:bg-orange-50/50 transition-colors ${i % 2 === 1 ? "bg-stone-50/40" : ""}`}>
                    <td className="px-4 py-3 text-sm font-semibold text-stone-800">{r.assetName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs text-stone-500">{r.assetCode}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {r.roomNumber ? `${r.roomNumber}号室` : <span className="text-stone-300">—</span>}
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
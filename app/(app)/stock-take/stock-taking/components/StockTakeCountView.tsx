"use client";

import { useStockTakeCount } from "@/app/(app)/stock-take/stock-taking/components/useStockTakeCount";
import NumberForm from "@/components/form/NumberForm";
import SubmitButton from "@/components/SubmitButton";
import { GetStockTakeWithLinesResult } from "@/lib/repositories/stockTakes/getAllStockTakeLines";

type Props = {
  stockTakeId: number;
  stockTakeLines: GetStockTakeWithLinesResult;
};

// 差分の表示スタイル
function getDeltaStyle(delta: number | null): string {
  if (delta === null) return "text-gray-300";
  if (delta === 0) return "text-gray-400";
  if (delta > 0) return "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold";
  return "text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-xs font-bold";
}

// 差分のテキスト（+/-符号付き）
function getDeltaText(delta: number | null): string {
  if (delta === null) return "—";
  if (delta === 0) return "±0";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

// 商品サムネイル
function ItemThumbnail({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  return (
    <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      {imageUrl
        ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-white flex items-center justify-center text-3xl">📦</div>
      }
    </div>
  );
}

export function StockTakeCountView({ stockTakeId, stockTakeLines }: Props) {
  const {
    // 状態
    isValid,
    isSubmitting,
    searchTerm,
    filterUncounted,
    filterDiff,
    totalCount,
    countedCount,
    displayItems,
    watchedLines,
    // フォーム
    register, errors,
    // ハンドラ
    onSubmit,
    handleBack,
    onSearchChange,
    onFilterUncountedChange,
    onFilterDiffChange,
  } = useStockTakeCount(stockTakeId, stockTakeLines);

  const progressPct = totalCount > 0 ? Math.round((countedCount / totalCount) * 100) : 0;

  // watchedLines から差分を計算
  function calcDelta(originalIdx: number, systemQty: number): number | null {
    const value = watchedLines[originalIdx]?.countedQty;
    if (value === undefined || value === null) return null;
    return Number(value) - systemQty;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-5 py-6">

        {/* ヘッダー：進捗バー */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg p-5">
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider mb-1">棚卸管理</p>
          <h1 className="text-white text-xl font-bold mb-4">カウント入力</h1>
          <div className="flex justify-between text-orange-100 text-xs mb-2">
            <span>{countedCount} / {totalCount} 件入力済み</span>
            <span className="text-white font-bold">{progressPct}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 space-y-3">
          <input
            type="text"
            placeholder="🔍 商品名で検索..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border-2 border-orange-200 rounded-xl px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none bg-white"
          />
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={filterUncounted} onChange={(e) => onFilterUncountedChange(e.target.checked)} className="accent-orange-500 w-4 h-4" />
              未入力のみ
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={filterDiff} onChange={(e) => onFilterDiffChange(e.target.checked)} className="accent-orange-500 w-4 h-4" />
              差分ありのみ
            </label>
            <span className="ml-auto text-xs text-gray-400">{displayItems.length}件</span>
          </div>
        </div>

        {/* 商品リスト */}
        <form onSubmit={onSubmit}>
          <div className="space-y-3">

            {/* 該当なし */}
            {displayItems.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                該当する商品がありません
              </div>
            )}

            {displayItems.map((line) => {
              const delta = calcDelta(line.originalIdx, line.systemQty);
              const rawValue = watchedLines[line.originalIdx]?.countedQty as unknown as string;
              const hasValue = rawValue !== "" && rawValue !== undefined && rawValue !== null;

              return (
                <div
                  key={line.id}
                  className={`bg-gradient-to-br from-orange-50 to-amber-50 border-2 rounded-xl p-4 ${hasValue ? "border-orange-300" : "border-orange-100"}`}
                >
                  <div className="flex items-center gap-4 flex-wrap">

                    {/* 商品名・サムネイル */}
                    <div className="flex items-center gap-3 flex-1 min-w-0" style={{ minWidth: 160 }}>
                      <ItemThumbnail imageUrl={line.imageUrl} name={line.name} />
                      <span className="font-bold text-base text-gray-800 truncate">{line.name}</span>
                    </div>

                    {/* システム数量 */}
                    <div className="flex-shrink-0 text-center" style={{ minWidth: 80 }}>
                      <p className="text-xs text-gray-500 mb-0.5">システム数量</p>
                      <p className="text-2xl font-bold text-gray-700">{line.systemQty}</p>
                    </div>

                    <span className="text-gray-300 text-xl flex-shrink-0">→</span>

                    {/* カウント入力 */}
                    <div className="flex-shrink-0" style={{ width: 130 }}>
                      <p className="text-xs text-orange-500 font-bold mb-1 text-center">カウント数量</p>
                      <NumberForm
                        props={{
                          label: "",
                          labelStyle: "sr-only",
                          name: `lines.${line.originalIdx}.countedQty` as never,
                          register,
                          inputStyle: "w-full border-2 border-orange-300 rounded-xl px-3 py-2.5 text-xl font-bold text-orange-600 focus:outline-none focus:border-orange-400 text-center bg-white",
                          placeholder: "0",
                          errors,
                        }}
                      />
                    </div>

                    {/* 差分 */}
                    <div className="flex-shrink-0 text-center" style={{ minWidth: 50 }}>
                      <p className="text-xs text-gray-400 mb-0.5">差分</p>
                      <span className={getDeltaStyle(delta)}>{getDeltaText(delta)}</span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* 保存ボタン */}
          <SubmitButton isFormValid={isValid} isSubmitting={isSubmitting} onBack={handleBack} />
        </form>

      </div>
    </div>
  );
}
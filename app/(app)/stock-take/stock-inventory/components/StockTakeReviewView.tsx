"use client";

import { useStockTakeReview, ReviewLine } from "@/app/(app)/stock-take/stock-inventory/components/useStockTakeReview";
import { GetStockTakeWithLinesResult } from "@/lib/repositories/stockTakes/getAllStockTakeLines";

type Props = {
    stockTakeLines: GetStockTakeWithLinesResult;
    stockTakeId: number;
};

// 差分バッジ（未入力・増加・減少・±0）
function DeltaBadge({ delta }: { delta: number | null }) {
    if (delta === null)
        return <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-bold">未入力</span>;
    if (delta > 0)
        return <span className="inline-block px-2.5 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-bold font-mono">+{delta.toLocaleString()}</span>;
    if (delta < 0)
        return <span className="inline-block px-2.5 py-0.5 rounded-md bg-red-100 text-red-600 text-xs font-bold font-mono">{delta.toLocaleString()}</span>;
    return <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-400 text-xs font-bold font-mono">±0</span>;
}

// サマリーカード（差分件数・未入力数など）
const STAT_COLORS = {
    warn: "text-orange-600",
    danger: "text-red-600",
    ok: "text-green-600",
    neutral: "text-gray-800",
} as const;

function StatCard({ label, value, color }: { label: string; value: string; color: keyof typeof STAT_COLORS }) {
    return (
        <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</div>
            <div className={`text-2xl font-black tabular-nums tracking-tight ${STAT_COLORS[color]}`}>{value}</div>
        </div>
    );
}

// 削除確認ダイアログ
function DeleteDialog({
    target, isDeleting, onConfirm, onCancel,
}: {
    target: ReviewLine;
    isDeleting: boolean;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}) {
    return (
        <div
            className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[300] flex items-center justify-center p-5"
            onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
            <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl">
                <div className="text-4xl text-center mb-3">🗑️</div>
                <p className="text-base font-extrabold text-gray-800 text-center mb-2 tracking-tight">
                    この明細を削除しますか？
                </p>
                <p className="text-sm text-gray-500 text-center mb-5 bg-gray-100 rounded-lg px-3 py-2">
                    {target.name}
                </p>
                <div className="flex gap-2.5">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200 disabled:opacity-60"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md disabled:opacity-60"
                    >
                        {isDeleting ? "削除中..." : "削除する"}
                    </button>
                </div>
            </div>
        </div>
    );
}

const TH_HEADERS = ["品番", "品名", "システム数", "カウント数", "差異", ""] as const;

export function StockTakeReviewView({ stockTakeLines, stockTakeId }: Props) {
    const {
        // 状態
        reviewLines, diffCount, uncountCount, plusTotal, minusTotal,
        hasUncounted, canConfirm, isPosting, postError,
        isDeleting, deleteError, deleteTarget,
        // ハンドラ
        onConfirm, onDeleteRequest, onDeleteConfirm, onDeleteCancel, onBack,
    } = useStockTakeReview({ stockTakeLines, stockTakeId });

    const confirmDisabled = !canConfirm || isPosting || reviewLines.length === 0;

    // 確定ボタンのスタイル（活性・非活性で切り替え）
    const confirmButtonStyle = confirmDisabled
        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
        : "bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-300 hover:opacity-90";

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-50 font-sans pb-24">

            {/* 削除確認ダイアログ（削除対象があるときのみ表示） */}
            {deleteTarget && (
                <DeleteDialog
                    target={deleteTarget}
                    isDeleting={isDeleting}
                    onConfirm={onDeleteConfirm}
                    onCancel={onDeleteCancel}
                />
            )}

            <div className="max-w-3xl mx-auto px-5 pt-5">

                {/* 未入力警告バナー */}
                {hasUncounted && (
                    <div className="bg-orange-50/95 border border-orange-200 border-l-4 border-l-orange-500 rounded-xl px-4 py-3.5 flex items-start gap-2.5 text-sm text-orange-900 font-medium">
                        <span>⚠</span>
                        <span>
                            未入力の明細が <strong>{uncountCount}</strong> 件あります。すべての数量を入力するまで確定できません。
                        </span>
                    </div>
                )}

                {/* サマリーカード（4列） */}
                <div className="grid grid-cols-4 gap-2.5 mt-5">
                    <StatCard label="差分件数" value={`${diffCount}`} color={diffCount > 0 ? "warn" : "ok"} />
                    <StatCard label="未入力" value={`${uncountCount}`} color={uncountCount > 0 ? "warn" : "ok"} />
                    <StatCard label="増加合計" value={`+${plusTotal.toLocaleString()}`} color={plusTotal > 0 ? "warn" : "ok"} />
                    <StatCard label="減少合計" value={`${minusTotal.toLocaleString()}`} color={minusTotal < 0 ? "danger" : "ok"} />
                </div>

                {/* 差分明細テーブル */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden mt-4">
                    <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100 bg-gray-50">
                        <span className="text-base">📊</span>
                        <span className="text-sm font-bold text-gray-700">差分明細</span>
                        <span className="text-[11px] text-gray-400 font-medium ml-0.5">|delta| 降順 · 未入力を先頭表示</span>
                    </div>

                    {reviewLines.length === 0 ? (
                        <div className="py-12 flex flex-col items-center gap-2">
                            <span className="text-5xl">✓</span>
                            <p className="font-bold text-gray-800 mt-2">差分のある明細はありません</p>
                            <p className="text-xs text-gray-400">すべての在庫数が一致しています</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse text-[13px]">
                            <thead>
                                <tr>
                                    {TH_HEADERS.map((h, i) => (
                                        <th
                                            key={i}
                                            className={`px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50 whitespace-nowrap ${i >= 2 ? "text-right" : "text-left"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reviewLines.map((line, idx) => {
                                    const isUncount = line.delta === null;
                                    return (
                                        <tr
                                            key={line.id}
                                            className={isUncount ? "bg-orange-50/60" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                                        >
                                            <td className="px-3.5 py-3 border-b border-gray-100 font-mono text-[11px] align-middle">{line.itemCode}</td>
                                            <td className="px-3.5 py-3 border-b border-gray-100 font-semibold text-gray-800 max-w-[220px] truncate align-middle">{line.name}</td>
                                            <td className="px-3.5 py-3 border-b border-gray-100 text-right tabular-nums font-mono align-middle">{line.systemQty.toLocaleString()}</td>
                                            <td className="px-3.5 py-3 border-b border-gray-100 text-right tabular-nums font-mono align-middle">
                                                {isUncount
                                                    ? <span className="inline-block px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-bold">未入力</span>
                                                    : line.countedQty!.toLocaleString()
                                                }
                                            </td>
                                            <td className="px-3.5 py-3 border-b border-gray-100 text-right align-middle">
                                                <DeltaBadge delta={line.delta} />
                                            </td>
                                            <td className="px-3.5 py-3 border-b border-gray-100 align-middle">
                                                <button
                                                    onClick={() => onDeleteRequest(line)}
                                                    disabled={isDeleting}
                                                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60"
                                                >
                                                    {isDeleting ? "…" : "削除"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* エラー表示 */}
                {deleteError && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">⚠ {deleteError}</div>
                )}
                {postError && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">⚠ {postError}</div>
                )}

            </div>

            {/* 画面下部に固定された操作ボタン */}
            <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-gray-100 px-5 py-3.5 flex justify-end items-center gap-3 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <button
                    onClick={onBack}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                >
                    戻る
                </button>
                <button
                    onClick={onConfirm}
                    disabled={confirmDisabled}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold text-white min-w-[140px] tracking-wide transition-all ${confirmButtonStyle}`}
                >
                    {isPosting ? "確定中..." : "確定する"}
                </button>
            </div>

        </div>
    );
}
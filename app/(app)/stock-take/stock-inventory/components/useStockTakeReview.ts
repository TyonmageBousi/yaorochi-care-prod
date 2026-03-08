"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GetStockTakeWithLinesResult } from "@/lib/repositories/stockTakes/getAllStockTakeLines";

type Props = {
  stockTakeLines: GetStockTakeWithLinesResult;
  stockTakeId: number;
};

type StockTakeLine = GetStockTakeWithLinesResult[number];
type StockTakeLineWithDelta = StockTakeLine & { delta: number | null };
type StockTakeLinesWithDelta = StockTakeLineWithDelta[];

export type ReviewLine = StockTakeLineWithDelta;

type PostState = "idle" | "posting" | "error";
type DeleteState = "idle" | "deleting" | "error";

export function useStockTakeReview({ stockTakeLines, stockTakeId }: Props) {
  const router = useRouter();

  const [stockTakeLinesWithDelta, setStockTakeLinesWithDelta] = useState<StockTakeLinesWithDelta>([]);

  // 確定・削除の状態管理
  const [postState, setPostState] = useState<PostState>("idle");
  const [postError, setPostError] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewLine | null>(null);

  // stockTakeLines に差分（delta）を付与
  const linesWithDelta = useMemo(() =>
    stockTakeLines.map((line) => ({
      ...line,
      delta: line.countedQty == null ? null : line.countedQty - line.systemQty,
    }))
    , [stockTakeLines]);

  // 差分あり・未入力のみ抽出し、未入力を先頭・|delta|降順で並べる
  const reviewLines = useMemo(() => {
    const filtered = linesWithDelta.filter((line) => line.delta === null || line.delta !== 0);
    return filtered.sort((a, b) => {
      if (a.delta === null && b.delta === null) return 0;
      if (a.delta === null) return -1;
      if (b.delta === null) return 1;
      return Math.abs(b.delta) - Math.abs(a.delta);
    });
  }, [linesWithDelta]);

  // 集計
  const diffCount = useMemo(() => reviewLines.filter((line) => line.delta !== null && line.delta !== 0).length, [reviewLines]);
  const uncountCount = useMemo(() => reviewLines.filter((line) => line.delta === null).length, [reviewLines]);
  const plusTotal = useMemo(() => reviewLines.reduce((acc, line) => (line.delta ?? 0) > 0 ? acc + line.delta! : acc, 0), [reviewLines]);
  const minusTotal = useMemo(() => reviewLines.reduce((acc, line) => (line.delta ?? 0) < 0 ? acc + line.delta! : acc, 0), [reviewLines]);

  // 未入力が残っているか
  const hasUncounted = useMemo(() => reviewLines.some((line) => line.countedQty == null), [reviewLines]);

  const isPosting = postState === "posting";
  const canConfirm = !hasUncounted && !isPosting;

  // 棚卸を確定してサーバーに送信
  const onConfirm = async () => {
    if (isPosting) return;
    setPostState("posting");
    setPostError(null);
    try {
      const res = await fetch(`/api/stock-take/${stockTakeId}/post`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `確定に失敗しました (${res.status})`);
      }
      router.push(`/dashboard`);
      setPostState("idle");
    } catch (e) {
      setPostError(e instanceof Error ? e.message : "確定に失敗しました");
      setPostState("error");
    }
  };

  // 明細削除（楽観的UI：先にUIから消してからAPIを叩く）
  const onDeleteRequest = (line: ReviewLine) => setDeleteTarget(line);
  const onDeleteCancel = () => setDeleteTarget(null);

  const onDeleteConfirm = async () => {
    if (!deleteTarget || deleteState === "deleting") return;

    const lineId = deleteTarget.id;
    const snapshot = stockTakeLinesWithDelta; // 失敗時のロールバック用

    setDeleteState("deleting");
    setDeleteError(null);
    setDeleteTarget(null);
    setStockTakeLinesWithDelta((prev) => prev.filter((line) => line.id !== lineId));

    try {
      const res = await fetch(`/api/stock-take/${stockTakeId}/lines/${lineId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? `削除に失敗しました (${res.status})`);
      }
      setDeleteState("idle");
    } catch (e) {
      setStockTakeLinesWithDelta(snapshot); // ロールバック
      setDeleteError(e instanceof Error ? e.message : "削除に失敗しました");
      setDeleteState("error");
    }
  };

  return {
    // 状態
    stockTakeLinesWithDelta: linesWithDelta,
    reviewLines,
    diffCount, uncountCount, plusTotal, minusTotal,
    hasUncounted, canConfirm, isPosting, postError,
    isDeleting: deleteState === "deleting", deleteError, deleteTarget,
    // ハンドラ
    onConfirm, onDeleteRequest, onDeleteConfirm, onDeleteCancel,
    onBack: () => router.back(),
  };
}
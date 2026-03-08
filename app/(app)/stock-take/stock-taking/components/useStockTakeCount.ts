"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stockTakeCountSchema, StockTakeCountValues } from "@/lib/validations/stock-takes/stockTakeCountSchema";
import { GetStockTakeWithLinesResult } from "@/lib/repositories/stockTakes/getAllStockTakeLines";
import { handleApiResponse } from "@/lib/services/handleApiResponse";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useStockTakeCount(stockTakeId: number, stockTakeLines: GetStockTakeWithLinesResult) {
  const router = useRouter();

  // 検索・フィルター状態
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUncounted, setFilterUncounted] = useState(false);
  const [filterDiff, setFilterDiff] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register, control, handleSubmit, setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<StockTakeCountValues>({
    resolver: zodResolver(stockTakeCountSchema),
    mode: "onChange",
    defaultValues: {
      lines: stockTakeLines.map((line) => ({
        lineId: line.id,
        countedQty: line.countedQty ?? undefined,
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "lines" });
  const watchedLines = useWatch({ control, name: "lines" });

  // カウント済み件数・合計件数（進捗表示用）
  const totalCount = stockTakeLines.length;
  const countedCount = watchedLines.filter((line) => {
    const value = line?.countedQty as unknown as string;
    return value !== "" && value !== undefined && value !== null;
  }).length;

  // 検索・フィルターを適用した表示リスト
  const displayItems = useMemo(() => {
    return stockTakeLines
      .map((line, originalIdx) => ({ ...line, originalIdx }))
      .filter(({ name, originalIdx }) => {
        if (searchTerm && !name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

        const rawValue = watchedLines[originalIdx]?.countedQty as unknown as string;
        const hasValue = rawValue !== "" && rawValue !== undefined && rawValue !== null;

        if (filterUncounted && hasValue) return false;

        if (filterDiff) {
          const countedQty = hasValue ? Number(rawValue) : undefined;
          const hasDiff = countedQty !== undefined && countedQty !== stockTakeLines[originalIdx].countedQty;
          if (!hasDiff) return false;
        }

        return true;
      });
  }, [stockTakeLines, searchTerm, filterUncounted, filterDiff, watchedLines]);

  // カウント結果をサーバーに保存
  const onSubmit = handleSubmit(async (data: StockTakeCountValues) => {
    setIsSaving(true);
    try {
      const lines = data.lines.map((line, idx) => ({
        lineId: stockTakeLines[idx].id,
        countedQty: line.countedQty,
      }));

      const res = await fetch(`/api/stock-take/${stockTakeId}/lines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });

      const result = await handleApiResponse<StockTakeCountValues, { stockTakeId: number }>(res, setError);

      if (result === false) return;

      toast.success(result.message ?? "棚卸しを保存しました");
      router.push(`../stock-take/stock-inventory?id=${stockTakeId}`);

    } catch (error) {
      toast.error("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  });

  const handleBack = () => router.push("/dashboard");

  return {
    // 状態
    isSaving, isValid, isSubmitting,
    searchTerm, filterUncounted, filterDiff,
    totalCount, countedCount,
    displayItems, watchedLines, fields,

    // フォーム
    register, errors,

    // ハンドラ
    onSubmit, handleBack,
    onSearchChange: setSearchTerm,
    onFilterUncountedChange: setFilterUncounted,
    onFilterDiffChange: setFilterDiff,
  };
}
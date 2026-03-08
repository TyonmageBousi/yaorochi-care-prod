'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { stockTakeFormSchema, StockTakeFormValues } from "@/lib/validations/stock-takes/stockTakes";
import { handleApiResponse } from "@/lib/services/handleApiResponse";
import { ProgressStockTake } from "@/lib/repositories/stockTakes/findExistStockTake";

export function useNewStockTakeForm(inProgressStockTake?: { id: number }) {
  const router = useRouter();

  const { register, handleSubmit, setError, formState: { errors, isSubmitting, isValid } } =
    useForm<StockTakeFormValues>({
      resolver: zodResolver(stockTakeFormSchema),
      mode: "onChange",
      defaultValues: { storageId: undefined, notes: undefined },
    });

  const [showModal, setShowModal] = useState(false);
  const [existingStockTake, setExistingStockTake] = useState<ProgressStockTake | null>(null);
  const onCloseModal = useCallback(() => setShowModal(false), []);

  const restartStockTake = async (stockTakeId: number) => {
    try {
      const res = await fetch(`/api/stock-take/cancel-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockTakeId }),
      });
      const result = await handleApiResponse(res, setError);
      if (!result) return;

      setShowModal(false);
      setExistingStockTake(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast("進行中棚卸のキャンセルに失敗しました");
    }
  };


  const onSubmit = handleSubmit(async (data: StockTakeFormValues) => {
    const payload = { storageId: data.storageId, ...(data.notes ? { notes: data.notes } : {}) };

    const res = await fetch("/api/stock-take/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.status === 409) {
      const body = await res.json();
      setExistingStockTake(body.existStockTake);
      setShowModal(true);
      return;
    }
    const result = await handleApiResponse<StockTakeFormValues, { stockTakeId: number; message?: string }>(res, setError);
    if (!result) return;

    toast.success(result.message ?? "保存しました");
    router.push(`/stock-take/stock-taking?id=${result.result.stockTakeId}`);
  });

  const handleBack = () => router.push("/dashboard");

  return {
    // 状態
    isSubmitting,
    isValid,
    showModal,
    existingStockTake,

    // フォーム
    register,
    errors,

    // ハンドラ
    onSubmit,
    handleBack,
    restartStockTake,
    onCloseModal,
  };

}
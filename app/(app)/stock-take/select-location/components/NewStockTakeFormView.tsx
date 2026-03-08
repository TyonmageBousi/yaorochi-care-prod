"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import OptionsForm, { type Options, FiledOptionsProps } from "@/components/form/OptionsForm";
import TextAreaForm, { FieldTextAreaProps } from "@/components/form/TextAreaForm";
import { useNewStockTakeForm } from "@/app/(app)/stock-take/select-location/components/useNewStockTakeForm";
import { StockTakeFormValues } from "@/lib/validations/stock-takes/stockTakes";
import SubmitButton from "@/components/SubmitButton";
import ResumeStockTakeModal from "@/app/(app)/stock-take/select-location/components/ResumeStockTakeModal";

type Props = {
  storages: Options[];
};

const labelStyle = "block text-sm font-medium text-gray-700 mb-1.5";
const inputStyle = "w-full rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition";
const textareaStyle = `${inputStyle} resize-none`;

export default function NewStockTakeFormView({ storages }: Props) {
  const {
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
    onCloseModal,
    restartStockTake
  } = useNewStockTakeForm();

  const storageProps: FiledOptionsProps<StockTakeFormValues> = {
    label: "保管場所",
    labelStyle,
    name: "storageId",
    inputStyle,
    options: storages,
    register,
    errors,
  };

  const notesProps: FieldTextAreaProps<StockTakeFormValues> = {
    label: "備考",
    labelStyle,
    name: "notes",
    inputStyle: textareaStyle,
    register,
    errors,
    placeholder: "任意入力",
    rows: 4,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 flex flex-col items-center px-4 py-8">

      {/* 進行中の棚卸がある場合に再開モーダルを表示 */}
      {showModal && existingStockTake && (
        <ResumeStockTakeModal
          stockTake={existingStockTake}
          storages={storages}
          onClose={onCloseModal}
          onRestart={() => restartStockTake(existingStockTake.id)}

        />
      )}

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* ページヘッダー */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-orange-100 text-xs font-medium tracking-wide uppercase">Stocktake</p>
              <h1 className="text-white text-xl font-bold leading-tight">棚卸新規作成</h1>
              <p className="text-orange-100 text-xs mt-0.5">保管場所を選択して棚卸を開始します</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-5">

          {/* 保管場所 */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
            <div className="border-b border-amber-100 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-xs font-semibold text-orange-700 tracking-wide uppercase">保管場所</span>
            </div>
            <div className="px-4 py-4">
              <OptionsForm props={storageProps} />
            </div>
          </div>

          {/* 備考 */}
          <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
            <div className="border-b border-amber-100 px-4 py-2.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase">備考</span>
            </div>
            <div className="px-4 py-4">
              <TextAreaForm props={notesProps} />
            </div>
          </div>

          {/* 送信ボタン */}
          <SubmitButton
            isFormValid={isValid}
            isSubmitting={isSubmitting}
            onBack={handleBack}
          />
          <div className="h-2" />

        </form>
      </div>
    </div>
  );
}
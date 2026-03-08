'use client';

import { useMemo } from "react";
import TextForm, { FieldTextProps } from "@/components/form/TextForm";
import TextAreaForm, { FieldTextAreaProps } from "@/components/form/TextAreaForm";
import type { RoomNumberFormValue } from "@/lib/validations/roomNumber";
import { useRoomNumberForm } from "./useRoomNumberForm";
import SubmitButton from "@/components/SubmitButton";

const inputStyle = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-base";
const labelStyle = "block text-sm font-bold text-gray-700 mb-2";

export default function RoomNumberFormView() {
    const {
        // 状態
        isSubmitting,
        isValid,
        // フォーム
        register,
        errors,
        // ハンドラ
        onSubmit,
        handleBack,
    } = useRoomNumberForm();

    const labelProps: FieldTextProps<RoomNumberFormValue> = {
        label: "部屋番号",
        labelStyle,
        name: "label",
        register,
        inputStyle,
        placeholder: "例: 101号室",
        errors,
    };

    const notesProps: FieldTextAreaProps<RoomNumberFormValue> = {
        label: "備考",
        labelStyle,
        name: "notes",
        register,
        inputStyle,
        rows: 4,
        placeholder: "備考を入力してください（任意）",
        errors,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100">
            <div className="max-w-3xl mx-auto px-5 py-6">
                <div className="max-w-md mx-auto p-5 space-y-5">

                    {/* 部屋番号登録カード */}
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">

                        {/* カードヘッダー */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
                            <h2 className="font-bold text-lg">🏠 部屋番号登録</h2>
                            <p className="text-xs opacity-90 mt-1">部屋番号と備考を入力してください</p>
                        </div>

                        {/* フォーム */}
                        <form onSubmit={onSubmit} className="p-5 space-y-4">
                            <TextForm props={labelProps} />
                            <TextAreaForm props={notesProps} />
                            <SubmitButton
                                isFormValid={isValid}
                                isSubmitting={isSubmitting}
                                onBack={handleBack}
                            />
                        </form>

                    </div>
                </div>
                <div className="h-2" />
            </div>
        </div>
    );
}
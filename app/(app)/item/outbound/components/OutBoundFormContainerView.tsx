'use client';

import { useState, useCallback } from "react";
import { RadioOption } from "@/components/form/RadioForm";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";
import OutBoundItemFormView from "./OutBoundRoomSelectFormView";
import OutBoundItemListView from "./OutBoundItemListView";
import OutBoundItemListSelectView from "./OutBoundItemListSelectView";
import SubmitButton from "@/components/SubmitButton";
import { useOutBoundForm } from "@/app/(app)/item/outbound/components/useOutBoundForm";

type Props = {
    items: ItemOptionWithStock[];
    storages: RadioOption[];
    rooms: RadioOption[];
};

export default function OutBoundFormContainerView({ items, storages, rooms }: Props) {
    const {
        // 状態
        isSubmitting,
        isValid,
        roomId,
        fields,
        items: upItems,
        storageOptions,
        roomOptions,
        // フォーム
        register,
        errors,
        // ハンドラ
        onSubmit,
        handleBack,
        addRow,
        removeRow,
    } = useOutBoundForm({ items, storages, rooms });

    const [showModal, setShowModal] = useState(false);

    const onOpenModal = useCallback(() => setShowModal(true), []);
    const onCloseModal = useCallback(() => setShowModal(false), []);

    const handleAddItem = useCallback((itemId: number) => {
        const alreadySelected = fields.some(field => field.itemId === itemId);
        if (alreadySelected) {
            setShowModal(false);
            return;
        }
        addRow(itemId);
        setShowModal(false);
    }, [fields, addRow]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-10">
            <div className="max-w-2xl mx-auto px-5 py-6">

                {/* ページヘッダー */}
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 shadow-lg mb-6">
                    <div className="max-w-xl mx-auto flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleBack}
                            aria-label="戻る"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-all text-xl font-bold flex-shrink-0"
                        >
                            ‹
                        </button>
                        <div>
                            <p className="text-sm opacity-90">スタッフ用</p>
                            <h2 className="text-2xl font-bold leading-tight">払出登録</h2>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">

                    {/* STEP 1 — 居室選択 */}
                    <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-5">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">STEP 1</p>
                        <p className="text-base font-bold text-slate-800 mb-4">利用居室番号</p>
                        <OutBoundItemFormView
                            register={register}
                            errors={errors}
                            roomOptions={roomOptions}
                        />
                    </div>

                    {/* STEP 2 — 商品リスト（居室選択後に表示） */}
                    {roomId !== "" && (
                        <div className="bg-white rounded-2xl shadow-md border border-orange-100 p-5">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">STEP 2</p>
                            <p className="text-base font-bold text-slate-800 mb-4">払い出す商品</p>
                            <OutBoundItemListView
                                fields={fields}
                                items={upItems}
                                register={register}
                                errors={errors}
                                storageOptions={storageOptions}
                                removeRow={removeRow}
                                onOpenModal={onOpenModal}
                            />
                        </div>
                    )}

                    {/* 送信ボタン */}
                    {roomId !== "" && fields.length > 0 && (
                        <SubmitButton
                            isFormValid={isValid}
                            isSubmitting={isSubmitting}
                            onBack={handleBack}
                        />
                    )}

                </form>

                {/* 商品選択モーダル */}
                {showModal && (
                    <OutBoundItemListSelectView
                        items={upItems}
                        fields={fields}
                        onAddItem={handleAddItem}
                        onClose={onCloseModal}
                    />
                )}

            </div>
        </div>
    );
}
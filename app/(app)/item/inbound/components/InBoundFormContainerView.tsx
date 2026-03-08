'use client';

import { useState } from 'react';
import { RadioOption } from "@/components/form/RadioForm";
import InBoundItemListView from "./InBoundItemListView";
import InBoundItemListSelectView from "./InBoundItemListSelectView";
import { useInBoundForm } from "@/app/(app)/item/inbound/components/useInBoundForm";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";
import SubmitButton from "@/components/SubmitButton";

type Props = {
    storageLocations: RadioOption[];
    itemOptions: ItemOptionWithStock[];
};

export default function InBoundFormContainerView({ itemOptions, storageLocations }: Props) {
    const {
        // 状態
        fields, items, storages, isSubmitting, isValid,
        // フォーム
        register, errors,
        // ハンドラ
        onSubmit, handleBack, addRow, removeRow,
    } = useInBoundForm({ itemOptions, storageLocations });

    const [showModal, setShowModal] = useState(false);

    // モーダルで選択した商品を追加（重複は無視）
    const handleAddItem = (itemId: number) => {
        if (fields.some((f) => f.itemId === itemId)) {
            setShowModal(false);
            return;
        }
        addRow(itemId);
        setShowModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 pb-6">
            <div className="max-w-2xl mx-auto px-5 py-6">

                {/* ヘッダー */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-5 shadow-lg">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-sm opacity-90">スタッフ用</p>
                        <h1 className="text-2xl font-bold mt-1">消耗品（おむつ等）の新規登録</h1>
                        <p className="text-sm mt-2 opacity-95">品目を登録し、初期在庫を入庫（台帳）に記録します</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-5 py-4">

                    {/* 入庫明細リスト */}
                    <InBoundItemListView
                        fields={fields}
                        items={items}
                        register={register}
                        errors={errors}
                        storages={storages}
                        removeRow={removeRow}
                        onOpenModal={() => setShowModal(true)}
                    />

                    {/* 明細が1件以上あれば送信ボタンを表示 */}
                    {fields.length > 0 && (
                        <SubmitButton isFormValid={isValid} isSubmitting={isSubmitting} onBack={handleBack} />
                    )}

                </form>

                {/* 商品選択モーダル */}
                {showModal && (
                    <InBoundItemListSelectView
                        items={items}
                        fields={fields}
                        onAddItem={handleAddItem}
                        onClose={() => setShowModal(false)}
                    />
                )}

            </div>
        </div>
    );
}
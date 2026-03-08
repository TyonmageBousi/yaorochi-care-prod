'use client';
import { useMemo } from "react";
import { UseFormRegister, FieldErrors, FieldArrayWithId } from "react-hook-form";
import { InBoundValues } from "@/lib/validations/inBound";
import { RadioOption } from "@/components/form/RadioForm";
import InBoundFormView from "./InBoundFormView";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";

type Props = {
    fields: FieldArrayWithId<InBoundValues, "rows", "id">[];
    items: ItemOptionWithStock[];
    register: UseFormRegister<InBoundValues>;
    errors: FieldErrors<InBoundValues>;
    storages: RadioOption[];
    removeRow: (index: number) => void;
    onOpenModal: () => void;
};

const addButtonStyle = "w-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-base mb-4";

export default function InBoundItemListView({ fields, items, register, errors, storages, removeRow, onOpenModal }: Props) {
    const storageOptions = useMemo(() => [
        { id: 0, label: "選択してください" },
        ...storages.map(s => ({ id: Number(s.id), label: s.label }))
    ], [storages]);

    return (
        <div>
            {/* 案内バナー */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <div className="text-sm text-blue-800 font-bold mb-1">📦 入庫する商品を選択</div>
                <div className="text-xs text-blue-700">複数の商品を選択できます。</div>
            </div>

            {/* 商品追加ボタン */}
            <button
                type="button"
                onClick={onOpenModal}
                className={addButtonStyle}
            >
                ＋ 商品を追加
            </button>

            {/* 選択済み商品リスト */}
            {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    まだ商品が選択されていません
                </div>
            ) : (
                <div className="space-y-3">
                    {fields.map((field, index) => {
                        const item = items.find(i => i.id === field.itemId);
                        if (!item) return null;
                        return (
                            <InBoundFormView
                                key={field.id}
                                field={field}
                                index={index}
                                item={item}
                                register={register}
                                errors={errors}
                                storageOptions={storageOptions}
                                removeRow={removeRow}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
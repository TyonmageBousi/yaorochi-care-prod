'use client';
import { UseFormRegister, FieldErrors, FieldArrayWithId } from "react-hook-form";
import { OutBoundValues } from "@/lib/validations/outBound";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";
import { RadioOption } from "@/components/form/RadioForm";
import OutBoundItemFormView from "@/app/(app)/item/outbound/components/OutBoundItemFormView";

type Props = {
    fields: FieldArrayWithId<OutBoundValues, "rows", "id">[];
    items: ItemOptionWithStock[];
    register: UseFormRegister<OutBoundValues>;
    errors: FieldErrors<OutBoundValues>;
    storageOptions: RadioOption[];
    removeRow: (index: number) => void;
    onOpenModal: () => void;
};

const addButtonStyle = "w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-base mb-4";

export default function OutBoundItemListView({ fields, items, register, errors, storageOptions, removeRow, onOpenModal }: Props) {
    return (
        <div>
            {/* 案内メッセージ */}
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                <div className="text-sm text-orange-800 font-bold mb-1">📦 払い出す商品を選択</div>
                <div className="text-xs text-orange-700">複数の商品を選択できます。</div>
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
                            <OutBoundItemFormView
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
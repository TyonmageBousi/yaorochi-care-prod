'use client';
import { useMemo } from "react";
import OptionsForm, { FiledOptionsProps } from "@/components/form/OptionsForm";
import NumberForm, { FieldNumberProps } from "@/components/form/NumberForm";
import TextAreaForm, { FieldTextAreaProps } from "@/components/form/TextAreaForm";
import { UseFormRegister, FieldErrors, FieldArrayWithId } from "react-hook-form";
import { OutBoundValues } from "@/lib/validations/outBound";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";
import { RadioOption } from "@/components/form/RadioForm";

type Props = {
    field: FieldArrayWithId<OutBoundValues, "rows", "id">;
    index: number;
    item: ItemOptionWithStock;
    register: UseFormRegister<OutBoundValues>;
    errors: FieldErrors<OutBoundValues>;
    storageOptions: RadioOption[];
    removeRow: (index: number) => void;
};

const inputStyle = "w-full px-3 py-2.5 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none text-base bg-white";
const labelStyle = "block text-sm font-bold text-gray-700 mb-1";
const textareaStyle = "w-full px-3 py-2.5 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none resize-none text-sm bg-white";
const removeButtonStyle = "text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-red-100 rounded-lg transition";

function ItemThumbnail({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
    if (imageUrl) {
        return <img src={imageUrl} alt={name} className="w-full h-full object-cover" />;
    }
    return (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">📦</span>
        </div>
    );
}

export default function OutBoundItemFormView({ field, index, item, register, errors, storageOptions, removeRow }: Props) {

    const storageProps: FiledOptionsProps<OutBoundValues> = {
    label: "出庫場所",
    labelStyle,
    name: `rows.${index}.storageId`,
    register,
    inputStyle,
    options: storageOptions,
    errors,
};

const qtyProps: FieldNumberProps<OutBoundValues> = {
    label: "数量",
    labelStyle,
    name: `rows.${index}.qty`,
    register,
    inputStyle,
    placeholder: "",
    errors,
};

const notesProps: FieldTextAreaProps<OutBoundValues> = {
    label: "メモ",
    labelStyle,
    name: `rows.${index}.notes`,
    register,
    inputStyle: textareaStyle,
    rows: 2,
    placeholder: "例: 夜勤帯の分",
    errors,
};

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">

            {/* 商品情報ヘッダー */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
                    <ItemThumbnail imageUrl={item.imageUrl} name={item.name} />
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="font-bold text-lg text-gray-800">{item.name}</div>
                            <div className="text-sm text-gray-600">
                                在庫: <span className="font-bold text-green-600">{item.currentStockQty}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className={removeButtonStyle}
                            aria-label="商品を削除"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>

            {/* hidden: itemId */}
            <input type="hidden" {...register(`rows.${index}.itemId` as const)} value={field.itemId} />

            {/* フォーム入力欄 */}
            <div className="space-y-3">
                <div>
                    <OptionsForm props={storageProps} />
                    {errors?.rows?.[index]?.storageId && (
                        <p className="mt-1 text-sm text-red-600">{errors.rows[index].storageId?.message}</p>
                    )}
                </div>
                <div>
                    <NumberForm props={qtyProps} />
                    {errors?.rows?.[index]?.qty && (
                        <p className="mt-1 text-sm text-red-600">{errors.rows[index].qty?.message}</p>
                    )}
                </div>
                <div>
                    <TextAreaForm props={notesProps} />
                </div>
            </div>

        </div>
    );
}
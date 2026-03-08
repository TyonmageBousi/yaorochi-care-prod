'use client';

import OptionsForm, { FiledOptionsProps } from "@/components/form/OptionsForm";
import NumberForm, { FieldNumberProps } from "@/components/form/NumberForm";
import TextAreaForm, { FieldTextAreaProps } from "@/components/form/TextAreaForm";
import { UseFormRegister, FieldErrors, FieldArrayWithId } from "react-hook-form";
import { InBoundValues } from "@/lib/validations/inBound";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";

type Props = {
    field: FieldArrayWithId<InBoundValues, "rows", "id">;
    index: number;
    item: ItemOptionWithStock;
    register: UseFormRegister<InBoundValues>;
    errors: FieldErrors<InBoundValues>;
    storageOptions: { id: number; label: string }[];
    removeRow: (index: number) => void;
};

const inputStyle = "w-full px-3 py-2.5 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none text-base bg-white";
const labelStyle = "block text-sm font-bold text-gray-700 mb-1";

// 商品サムネイル：画像があれば表示、なければ絵文字
function ItemThumbnail({ imageUrl, name }: { imageUrl: string | null; name: string }) {
    return (
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden shadow-md">
            {imageUrl
                ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                </div>
            }
        </div>
    );
}

export default function InBoundFormView({ field, index, item, register, errors, storageOptions, removeRow }: Props) {

    const storageProps: FiledOptionsProps<InBoundValues> = {
        label: "どこに保管する？",
        labelStyle,
        name: `rows.${index}.storageId`,
        register,
        inputStyle,
        options: storageOptions,
        errors,
    };

    const qtyProps: FieldNumberProps<InBoundValues> = {
        label: "いくつ入庫する？",
        labelStyle,
        name: `rows.${index}.qty`,
        register,
        inputStyle,
        placeholder: "",
        errors,
    };

    const notesProps: FieldTextAreaProps<InBoundValues> = {
        label: "メモ",
        labelStyle,
        name: `rows.${index}.notes`,
        register,
        inputStyle: "w-full px-3 py-2.5 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none resize-none text-sm bg-white",
        rows: 2,
        placeholder: "例: 新規購入分",
        errors,
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">

            {/* 商品ヘッダー：サムネイル・名前・在庫数・削除ボタン */}
            <div className="flex items-start gap-4 mb-4">
                <ItemThumbnail imageUrl={item.imageUrl} name={item.name} />
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-bold text-lg text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">
                                現在の在庫: <span className="font-bold text-green-600">{item.currentStockQty}</span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="text-red-500 hover:text-red-700 text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-red-100 rounded-lg transition"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>

            <input type="hidden" {...register(`rows.${index}.itemId` as const)} value={field.itemId} />

            {/* 入力フォーム：保管場所・数量・メモ */}
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
                <TextAreaForm props={notesProps} />
            </div>

        </div>
    );
}
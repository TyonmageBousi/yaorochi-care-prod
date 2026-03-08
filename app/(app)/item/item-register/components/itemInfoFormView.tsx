'use client';
import TextForm, { FieldTextProps } from "@/components/form/TextForm";
import NumberForm, { FieldNumberProps } from "@/components/form/NumberForm";
import TextAreaForm, { FieldTextAreaProps } from "@/components/form/TextAreaForm";
import RadioForm, { RadioOption, FieldRadioProps } from "@/components/form/RadioForm";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { ItemValues } from "@/lib/validations/item";


type Props = {
    register: UseFormRegister<ItemValues>;
    errors: FieldErrors<ItemValues>;
    unitOptions: RadioOption[];
};

const inputStyle = "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition-all";
const labelStyle = "block text-sm font-bold text-gray-700 mb-2";

export default function itemInfoFormView({ register, errors, unitOptions }: Props) {
    const itemCodeProps: FieldTextProps<ItemValues> = {
        label: "品目コード（SKU）",
        labelStyle,
        name: "itemCode",
        register,
        inputStyle,
        placeholder: "DIAPER-M-001",
        errors,
    };

    const nameProps: FieldTextProps<ItemValues> = {
        label: "品目名",
        labelStyle,
        name: "name",
        register,
        inputStyle,
        placeholder: "紙おむつ Mサイズ",
        errors,
    };

    const unitProps: FieldRadioProps<ItemValues> = {
        label: "管理単位",
        labelStyle: "text-sm font-bold text-gray-700 mb-3",
        name: "unit",
        register,
        itemStyle: "flex items-center gap-3 cursor-pointer hover:bg-orange-50 p-3 rounded-xl border-2 border-transparent has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50 transition-all",
        options: unitOptions,
        errors,
        required: true,
    };

    const reorderPointProps: FieldNumberProps<ItemValues> = {
        label: "発注点（reorderPoint）",
        labelStyle,
        name: "reorderPoint",
        register,
        inputStyle,
        placeholder: "50",
        errors,
    };

    const parLevelProps: FieldNumberProps<ItemValues> = {
        label: "適正在庫（parLevel）",
        labelStyle,
        name: "parLevel",
        register,
        inputStyle,
        placeholder: "200",
        errors,
    };

    const notesProps: FieldTextAreaProps<ItemValues> = {
        label: "メモ",
        labelStyle,
        name: "notes",
        register,
        inputStyle,
        rows: 4,
        placeholder: "例：夜間の消費が多い、サイズ注意など",
        errors,
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">品目情報</h2>
            <div className="space-y-4">

                {/* 基本情報 */}
                <TextForm props={itemCodeProps} />
                <TextForm props={nameProps} />

                {/* 管理単位 */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                    <RadioForm props={unitProps} />
                    <p className="text-xs text-gray-500 mt-2">
                        ※ qty はこの単位で記録されます（例：枚なら「+120枚」）
                    </p>
                </div>

                {/* 在庫管理数値 */}
                <div className="grid grid-cols-2 gap-4">
                    <NumberForm props={reorderPointProps} />
                    <NumberForm props={parLevelProps} />
                </div>

                {/* メモ */}
                <TextAreaForm props={notesProps} />

            </div>
        </div>
    );
}
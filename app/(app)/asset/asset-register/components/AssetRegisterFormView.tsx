'use client';

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CareAssetValues } from "@/lib/validations/asset";
import TextForm, { FieldTextProps } from "@/components/form/TextForm";
import TextAreaForm, { FieldTextAreaProps } from "@/components/form/TextAreaForm";

type Props = {
    register: UseFormRegister<CareAssetValues>;
    errors: FieldErrors<CareAssetValues>;
};

const inputStyle = "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition-all";
const labelStyle = "block text-sm font-bold text-gray-700 mb-2";

export default function AssetRegisterFormView({ register, errors }: Props) {

    const assetCodeProps: FieldTextProps<CareAssetValues> = {
        label: "資産コード",
        labelStyle,
        name: "assetCode",
        register,
        inputStyle,
        placeholder: "ASSET-001",
        errors,
    };

    const nameProps: FieldTextProps<CareAssetValues> = {
        label: "商品名",
        labelStyle,
        name: "name",
        register,
        inputStyle,
        placeholder: "車椅子用クッション",
        errors,
    };

    const notesProps: FieldTextAreaProps<CareAssetValues> = {
        label: "メモ",
        labelStyle,
        name: "notes",
        register,
        inputStyle,
        rows: 4,
        placeholder: "商品に関するメモを入力してください",
        errors,
    };

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">基本情報</h2>
            <div className="space-y-4">
                <TextForm props={assetCodeProps} />
                <TextForm props={nameProps} />
                <TextAreaForm props={notesProps} />
            </div>
        </div>
    );
}

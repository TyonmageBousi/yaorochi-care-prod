'use client';

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { CareAssetValues, OWNER_TYPE_STR } from "@/lib/validations/asset";
import RadioForm, { RadioOption, FieldRadioProps } from "@/components/form/RadioForm";
import { assetStatuses, owners, } from "@/lib/constants/asset";
import { ASSET_STATUS } from "@/db/schema"
type Props = {
    register: UseFormRegister<CareAssetValues>;
    errors: FieldErrors<CareAssetValues>;
    owner: CareAssetValues["owner"] | undefined;
    onOwnerChange: (value: string) => void;
    storageLocations: RadioOption[];
    roomNumbers: RadioOption[];
    categories: RadioOption[];
};

const itemStyle = "flex items-center gap-3 cursor-pointer hover:bg-orange-50 p-3 rounded-xl border-2 border-transparent has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50 transition-all";
const labelStyle = "text-lg font-bold text-gray-800 mb-4";
export const visibleAssetStatuses: RadioOption[] =
    assetStatuses.filter(
        (status) => status.id !== ASSET_STATUS.RETIRED
    );
// 白いカードのラッパー（各ラジオセクションで共通）
function CardSection({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            {children}
        </div>
    );
}

export default function AssetRadioFormView({
    register, errors, owner, onOwnerChange,
    storageLocations, roomNumbers, categories,
}: Props) {

    const categoryProps: FieldRadioProps<CareAssetValues> = {
        label: "カテゴリ", labelStyle, name: "categoryId",
        register, itemStyle, options: categories, errors, required: true,
    };

    const storageProps: FieldRadioProps<CareAssetValues> = {
        label: "保存場所", labelStyle, name: "storageId",
        register, itemStyle, options: storageLocations, errors, required: true,
    };

    const statusProps: FieldRadioProps<CareAssetValues> = {
        label: "ステータス", labelStyle, name: "status",
        register, itemStyle, options: visibleAssetStatuses, errors, required: true,
    };

    const ownerProps: FieldRadioProps<CareAssetValues> = {
        label: "所有者", labelStyle, name: "owner",
        register, itemStyle, options: owners, errors, required: true,
        onChange: onOwnerChange,
    };

    const roomNumberProps: FieldRadioProps<CareAssetValues> = {
        label: "部屋番号", labelStyle, name: "roomNumberId",
        register, itemStyle, options: roomNumbers, errors, required: true,
    };

    return (
        <div className="space-y-4">

            {/* カテゴリ・保存場所（2カラム） */}
            <div className="grid md:grid-cols-2 gap-4">
                <CardSection><RadioForm props={categoryProps} /></CardSection>
                <CardSection><RadioForm props={storageProps} /></CardSection>
            </div>

            {/* ステータス・所有者（2カラム） */}
            <div className="grid md:grid-cols-2 gap-4">
                <CardSection><RadioForm props={statusProps} /></CardSection>
                <CardSection><RadioForm props={ownerProps} /></CardSection>
            </div>

            {/* 部屋番号（レンタル品のみ表示） */}
            {owner === OWNER_TYPE_STR.RENTAL && (
                <CardSection>
                    <RadioForm props={roomNumberProps} />
                </CardSection>
            )}

        </div>
    );
}
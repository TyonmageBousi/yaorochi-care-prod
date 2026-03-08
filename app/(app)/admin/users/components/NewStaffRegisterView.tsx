'use client';

import { UserCog } from 'lucide-react';
import TextForm, { FieldTextProps } from '@/components/form/TextForm'
import PasswordForm, { FieldPasswordProps } from '@/components/form/PassWordForm'
import OptionsForm, { FiledOptionsProps } from '@/components/form/OptionsForm'
import DateForm, { FieldDateProps } from '@/components/form/DateForm'
import { StaffRegisterValues } from '@/lib/validations/newStaff'
import { useNewStaffRegister } from "@/app/(app)/admin/users/components/useNewStaffRegister"
import SubmitButton from "@/components/SubmitButton"
import { owners } from "@/lib/constants/roleType"

export default function NewStaffRegisterView() {

    const {
        register,
        errors,
        isValid,
        isSubmitting,
        handleBack,
        onSubmit
    } = useNewStaffRegister();



    // スタッフID
    const staffIdProps: FieldTextProps<StaffRegisterValues> = {
        label: 'スタッフID',
        labelStyle: "text-black",
        name: 'userId',
        register,
        inputStyle: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors",
        placeholder: '例: ST001',
        errors,
    };

    // 氏名
    const nameProps: FieldTextProps<StaffRegisterValues> = {
        label: '氏名',
        labelStyle: "text-black",
        name: 'name',
        register,
        inputStyle: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors",
        placeholder: '例: 山田太郎',
        errors,
    };

    // 電話番号
    const phoneProps: FieldTextProps<StaffRegisterValues> = {
        label: '電話番号',
        labelStyle: "text-black",

        name: 'phone',
        register,
        inputStyle: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors",
        placeholder: '例: 090-1234-5678',
        errors,
    };

    // 入社日
    const hireDateProps: FieldDateProps<StaffRegisterValues> = {
        label: '入社日',
        labelStyle: "text-black",
        name: 'hireDate',
        register,
        inputStyle: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors",
        errors,
    };

    // パスワード
    const passwordProps: FieldPasswordProps<StaffRegisterValues> = {
        label: 'パスワード',
        labelStyle: "text-black",
        name: 'password',
        register,
        inputStyle: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors",
        placeholder: '8文字以上',
        errors,
    };

    // パスワード確認
    const passwordConfirmProps: FieldPasswordProps<StaffRegisterValues> = {
        label: 'パスワード（確認）',
        labelStyle: "text-black",
        name: 'passwordConfirm',
        register,
        inputStyle: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors",
        placeholder: 'もう一度入力',
        errors,
    };

    // 権限
    const roleProps: FiledOptionsProps<StaffRegisterValues> = {
        label: '権限',
        labelStyle: "text-black",
        name: 'role',
        register,
        inputStyle: "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors bg-white  text-black",
        errors,
        options: owners
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            {/* ヘッダー帯 */}
            <div className='max-w-2xl mx-auto px-5 py-6'>
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-6 shadow-lg">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 mb-2">
                            <UserCog className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">スタッフ新規登録</h1>
                        </div>
                        <p className="text-sm opacity-90">
                            新しいスタッフの情報を入力してください
                        </p>
                    </div>
                </div>

                {/* メインコンテンツ */}
                <div className="py-6">
                    <form onSubmit={onSubmit}>
                        {/* 基本情報カード */}
                        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
                            <div className="border-b border-gray-100 pb-3 mb-5">
                                <h2 className="text-lg font-bold text-gray-900">基本情報</h2>
                            </div>

                            {/* スタッフID */}
                            <div className="mb-5">
                                < TextForm props={staffIdProps} />
                            </div>

                            {/* 氏名 */}
                            <div className="mb-5">
                                <div className="mb-5">
                                    < TextForm props={nameProps} />
                                </div>
                            </div>

                            {/* 電話番号 */}
                            <div className="mb-5">
                                < TextForm props={phoneProps} />
                            </div>

                            {/* 入社日 */}
                            <div>
                                <DateForm props={hireDateProps} />
                            </div>
                        </div>

                        {/* アカウント情報カード */}
                        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
                            {/* パスワード */}
                            <div className="mb-5">
                                < PasswordForm props={passwordProps} />
                            </div>

                            {/* パスワード確認 */}
                            <div>
                                < PasswordForm props={passwordConfirmProps} />
                            </div>
                        </div>

                        {/* 権限・施設情報カード */}
                        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
                            <div className="border-b border-gray-100 pb-3 mb-5">
                                <h2 className="text-lg font-bold text-gray-900">権限・施設情報</h2>
                            </div>

                            {/* 権限 */}
                            <div className="mb-5">
                                <OptionsForm props={roleProps} />
                            </div>
                        </div>

                        <SubmitButton isFormValid={isValid} isSubmitting={isSubmitting} onBack={handleBack} />

                    </form>

                    <div className="h-6"></div>
                </div>
            </div>

        </div>
    );
}
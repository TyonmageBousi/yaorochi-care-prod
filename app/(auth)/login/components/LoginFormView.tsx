"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginRequest } from "@/lib/validations/auth";
import { useState } from "react";
import TextForm, { FieldTextProps } from "@/components/form/TextForm";
import PasswordForm, { FieldPasswordProps } from "@/components/form/PassWordForm";
import { TestLoginInfo } from "@/components/TestLoginInfo"

export default function LoginFormView() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginRequest>({
        resolver: zodResolver(loginSchema),
    });

    const userIdProps: FieldTextProps<LoginRequest> = {
        label: "ユーザーID",
        labelStyle: "text-gray-700 font-medium text-sm",
        name: "userId",
        register,
        inputStyle:
            "block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-base bg-white transition",
        placeholder: "user@example.com",
        errors,
    };

    const passwordProps: FieldPasswordProps<LoginRequest> = {
        label: "パスワード",
        labelStyle: "text-gray-700 font-medium text-sm",
        name: "password",
        register,
        inputStyle:
            "block w-full px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-base bg-white transition",
        errors,
    };

    const onSubmit = async (data: LoginRequest) => {
        setError("");
        setIsLoading(true);
        try {
            const result = await signIn("credentials", {
                userId: data.userId,
                password: data.password,
                redirect: false,
            });
            if (result?.error) {
                setError("ユーザーIDまたはパスワードが正しくありません");
            } else if (result?.ok) {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("ログインに失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4">
            <TestLoginInfo />
            {/* PC：左右2カラム / モバイル：1カラム */}
            <div className="w-full max-w-4xl flex rounded-3xl shadow-2xl overflow-hidden">

                {/* 左パネル：ブランド帯（PCのみ表示） */}
                <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-orange-500 to-amber-500 p-10 text-white">
                    <div>
                        <div className="text-3xl font-black tracking-tight mb-2">
                            八尾路智ケア
                        </div>
                        <div className="text-orange-100 text-sm font-medium">
                            介護在庫管理システム
                        </div>
                    </div>

                    <div className="space-y-5">
                        {[
                            { icon: "📦", title: "在庫管理", desc: "リアルタイムで在庫状況を把握" },
                            { icon: "📋", title: "払出記録", desc: "スタッフの払出履歴を一元管理" },
                        ].map((item) => (
                            <div key={item.title} className="flex items-start gap-3">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <div className="font-semibold text-sm">{item.title}</div>
                                    <div className="text-orange-100 text-xs">{item.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-orange-200 text-xs">
                        © 2024 八尾路智ケア
                    </div>
                </div>

                {/* 右パネル：ログームフォーム */}
                <div className="flex-1 bg-white p-8 md:p-12 flex flex-col justify-center">

                    <div className="md:hidden text-center mb-8">
                        <div className="text-2xl font-black text-orange-500 mb-1">八尾路智ケア</div>
                        <div className="text-gray-500 text-sm">介護在庫管理システム</div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-1">ログイン</h2>
                    <p className="text-gray-400 text-sm mb-8">アカウント情報を入力してください</p>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <TextForm props={userIdProps} />
                        </div>
                        <div>
                            <PasswordForm props={passwordProps} />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 shadow-md shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2"
                        >
                            {isLoading ? "ログイン中..." : "ログイン"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StaffRegisterValues, staffRegisterFormSchema } from '@/lib/validations/newStaff';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { handleApiResponse } from "@/lib/services/handleApiResponse"

export function useNewStaffRegister() {
    const {
        register,
        handleSubmit,
        setError: setError,
        formState: { errors, isValid, isSubmitting },
    } = useForm<StaffRegisterValues>({
        resolver: zodResolver(staffRegisterFormSchema),
        mode: "onChange",
    });

    const router = useRouter();

    const onSubmit = handleSubmit(async (data: StaffRegisterValues) => {

        try {
            const res = await fetch("/api/staff/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await handleApiResponse<StaffRegisterValues>(res, setError);

            if (result === false) return

            toast.success(result.message ?? "登録に成功しました。")
            router.push("/dashboard");

        } catch (err) {
            toast.error("通信エラーが発生しました");
        }
    });
    const handleBack = () => router.push('/dashboard');

    return {
        // 状態
        isValid,
        isSubmitting,
        //フォーム
        register,
        errors,
        //ハンドラ
        handleBack,
        onSubmit,
    };
}

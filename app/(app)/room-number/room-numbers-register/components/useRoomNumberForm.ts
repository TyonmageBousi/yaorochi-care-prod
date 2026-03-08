'use client';

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roomNumberFormSchema, RoomNumberFormValue, RoomNumberFormKey } from "@/lib/validations/roomNumber";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { handleApiResponse } from "@/lib/services/handleApiResponse";

export function useRoomNumberForm() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
        setError,
        clearErrors,
    } = useForm<RoomNumberFormValue>({
        resolver: zodResolver(roomNumberFormSchema),
        mode: "onChange",
        defaultValues: { label: "" },
    });

    const handleBack = useCallback(() => router.push("/dashboard"), [router]);

    const onSubmit = handleSubmit(async (data) => {
        clearErrors();
        try {
            const res = await fetch("/api/room-number/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await handleApiResponse<RoomNumberFormValue>(res, setError);
            if (result === false) return
            toast.success(result.message ?? "登録に成功しました！");
            router.push("/dashboard");
        } catch {
            setError("root", { message: "予期しないエラーが発生しました" });
        }
    });

    return {
        // 状態
        isSubmitting,
        isValid,
        // フォーム
        register,
        errors,
        // ハンドラ
        onSubmit,
        handleBack,
    };
}
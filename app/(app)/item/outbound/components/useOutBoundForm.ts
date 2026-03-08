'use client';

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { outboundFormSchema, OutBoundValues } from "@/lib/validations/outBound";
import { RadioOption } from "@/components/form/RadioForm";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";
import { handleApiResponse } from "@/lib/services/handleApiResponse";

type UsePayoutFormProps = {
    items: ItemOptionWithStock[];
    storages: RadioOption[];
    rooms: RadioOption[];
};

export function useOutBoundForm({ items, storages, rooms }: UsePayoutFormProps) {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        control,
        setError,
        formState: { errors, isValid, isSubmitting },
    } = useForm<OutBoundValues>({
        resolver: zodResolver(outboundFormSchema),
        mode: "onChange",
        defaultValues: {
            roomId: "",
            rows: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rows",
    });

    const roomId = watch("roomId");

    const addRow = useCallback((itemId: number) => {
        append({ itemId, storageId: "", qty: 1, notes: "" });
    }, [append]);

    const removeRow = useCallback((index: number) => {
        remove(index);
    }, [remove]);

    const handleBack = useCallback(() => router.push("/dashboard"), [router]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            const res = await fetch("/api/outbound/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await handleApiResponse<OutBoundValues>(res, setError);

            if (result === false) return
            toast.success(result.message ?? "✅ 払出を記録しました！");
            router.push("/dashboard");

        } catch (error) {
            console.error("Payout submission error:", error);
            toast.error("払出の記録中にエラーが発生しました");
        }
    });

    return {
        // 状態
        isSubmitting,
        isValid,
        roomId,
        fields,
        items,
        storageOptions: storages,
        roomOptions: rooms,
        // フォーム
        register,
        errors,
        // ハンドラ
        onSubmit,
        handleBack,
        addRow,
        removeRow,
    };
}
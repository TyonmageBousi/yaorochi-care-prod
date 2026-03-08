'use client';

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inBoundFormSchema, InBoundValues } from "@/lib/validations/inBound";
import { RadioOption } from "@/components/form/RadioForm";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";
import { handleApiResponse } from "@/lib/services/handleApiResponse";

type Props = {
    storageLocations: RadioOption[];
    itemOptions: ItemOptionWithStock[];
};

export function useInBoundForm({ itemOptions, storageLocations }: Props) {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setError,
        control,
        formState: { errors, isValid, isSubmitting },
    } = useForm<InBoundValues>({
        resolver: zodResolver(inBoundFormSchema),
        mode: "onChange",
        defaultValues: { rows: [] },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "rows" });

    const addRow = (itemId: number) => {
        append({ itemId, storageId: "", qty: 1, notes: "" });
    };

    const removeRow = (index: number) => remove(index);

    const onSubmit = handleSubmit(async (data) => {
        try {
            const res = await fetch("/api/inbound/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await handleApiResponse<InBoundValues>(res, setError);

            if (result === false) return
            toast.success(result.message ?? "入庫を記録しました！")
            router.push("/dashboard");

        } catch (error) {
            console.error("Stock-in submission error:", error);
            toast.error("入庫の記録中にエラーが発生しました");
        }
    });

    const handleBack = () => router.push("/dashboard");

    return {
        // 状態
        items: itemOptions,
        storages: storageLocations,
        isSubmitting,
        isValid,
        fields,
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
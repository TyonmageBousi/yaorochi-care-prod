import { useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResidentValues, residentFormSchema } from "@/lib/validations/residentRegister";
import { RoomResidentName } from "@/lib/repositories/roomNumbers/getAllRoomResidentName";
import { handleApiResponse } from "@/lib/services/handleApiResponse";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function buildDefaultRows(rooms: RoomResidentName[]): ResidentValues["rows"] {
    return rooms
        .filter(room => room.residentName === null)  
        .map(room => ({
            roomId: String(room.id),
            residentName: "",
        }));
}

export function useResidentRegister(rooms: RoomResidentName[]) {
    const router = useRouter();

    const defaultValues = useMemo(
        () => ({ rows: buildDefaultRows(rooms) }),
        [rooms]
    );

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isValid, isSubmitting },
        reset,
        setValue,
        setError,
    } = useForm<ResidentValues>({
        resolver: zodResolver(residentFormSchema),
        mode: "onChange",
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({ control, name: "rows" });

    const watchedRows = watch("rows") as ResidentValues["rows"];
    const usedRoomIds = (watchedRows ?? []).map(r => Number(r.roomId)).filter(id => id !== 0);

    // 送信ボタンのカウント表示用
    const filledCount = (watchedRows ?? []).filter(
        r => r.roomId !== "" && (r.residentName ?? "").trim() !== ""

    ).length;

    const remainingRooms = rooms.length - usedRoomIds.length;

    const handleAdd = useCallback(() => {
        if (remainingRooms <= 0) return;
        append({ roomId: "", residentName: "" });
    }, [remainingRooms, append]);

    const handleRemove = useCallback((index: number) => {
        if (fields.length > 1) remove(index);
    }, [fields.length, remove]);

    // クリア時も rooms の初期値に戻す
    const handleClear = useCallback(() => reset(defaultValues), [reset, defaultValues]);

    const handleBack = useCallback(() => router.push("/dashboard"), [router]);

    const handleRoomChange = useCallback((index: number, roomId: string) => {
        const room = rooms.find(r => r.id === Number(roomId));
        setValue(`rows.${index}.residentName`, room?.residentName ?? "");
    }, [rooms, setValue]);


    const onSubmit = handleSubmit(async (data) => {
        try {
            const res = await fetch("/api/resident-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await handleApiResponse<ResidentValues>(res, setError);

            if (result === false) return

            toast.success(result.message ?? "登録しました。")
            router.push("/dashboard");

        } catch {
            toast.error("登録に失敗しました");
        }
    });

    return {
        // 状態
        isSubmitting,
        isValid,
        fields,
        watchedRows,
        usedRoomIds,
        filledCount,
        remainingRooms,
        // フォーム
        register,
        errors,
        // ハンドラ
        onSubmit,
        handleAdd,
        handleRemove,
        handleBack,
        handleClear,
        handleRoomChange
    };
}
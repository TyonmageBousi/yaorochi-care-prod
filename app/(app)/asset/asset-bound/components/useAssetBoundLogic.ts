'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetEventFormSchema, type AssetEventValues } from '@/lib/validations/assetEventSchema';
import type { EventType } from '@/lib/constants/eventTypes';
import type { ListAssetsResult } from "@/lib/repositories/assets/getAllAssets";
import type { RoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import type { StorageLocationOption } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { toast } from "sonner";
import { handleApiResponse } from "@/lib/services/handleApiResponse";
import { useRouter } from 'next/navigation';
import { ASSET_EVENT_TYPE } from '@/db/schema';


export type AssetOption = ListAssetsResult[number];

export interface AssetEventFormProps {
    assetAllOptions: ListAssetsResult;
    storageLocations: StorageLocationOption[];
    roomNumbers: RoomNumbers[];
}


const normalize = (v: unknown) =>
    String(v ?? "").trim().toLowerCase().replace(/\s+/g, "");


export function useAssetBoundLogic({
    assetAllOptions,
    storageLocations,
    roomNumbers,
}: AssetEventFormProps) {

    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");
    const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
    const router = useRouter();

    const {
        handleSubmit, control, setValue, setError, clearErrors,
        register, resetField,
        formState: { errors, isValid, isSubmitting },
    } = useForm<AssetEventValues>({
        resolver: zodResolver(assetEventFormSchema),
        mode: 'onChange',
        defaultValues: {
            assetId: 0,
            eventType: ASSET_EVENT_TYPE.MOVE,
            toStorageId: undefined,
            toRoomNumberId: undefined,
            notes: '',
        },
    });

    const assetId = useWatch({ control, name: 'assetId' });
    const selectedEventType = useWatch({ control, name: 'eventType' }) ?? null;

    // 名前・コードで資産を絞り込む
    const filteredAssets = useMemo(() => {
        const normalizedName = normalize(searchName);
        const normalizedCode = normalize(searchCode);
        if (!normalizedName && !normalizedCode) return assetAllOptions;
        return assetAllOptions.filter((a) =>
            (!normalizedName || normalize(a.name).includes(normalizedName)) &&
            (!normalizedCode || normalize(a.assetCode).includes(normalizedCode))
        );
    }, [assetAllOptions, searchName, searchCode]);

    // assetId が変わったら選択資産・移動先をリセット
    useEffect(() => {
        setSelectedAsset(assetAllOptions.find((a) => a.id === assetId) ?? null);
        resetField("toStorageId", { defaultValue: undefined });
        resetField("toRoomNumberId", { defaultValue: undefined });
    }, [assetId, assetAllOptions, resetField]);

    // イベント種別による表示制御
    const needsDestination = selectedEventType === ASSET_EVENT_TYPE.MOVE || selectedEventType === ASSET_EVENT_TYPE.UNASSIGN_ROOM;
    const needsRoom = selectedEventType === ASSET_EVENT_TYPE.ASSIGN_ROOM;

    // 資産選択
    const onSelectAsset = useCallback(
        (id: number) => setValue("assetId", id, { shouldDirty: true, shouldValidate: true }),
        [setValue]
    );

    // イベント種別選択（移動先・備考もリセット）
    const onSelectEventType = useCallback((type: EventType) => {
        setValue('eventType', type, { shouldDirty: true, shouldValidate: true });
        resetField('toStorageId', { defaultValue: undefined });
        resetField('toRoomNumberId', { defaultValue: undefined });
        resetField('notes', { defaultValue: '' });
    }, [setValue, resetField]);

    const onClearSearch = useCallback(() => {
        setSearchName("");
        setSearchCode("");
    }, []);

    // フォーム送信
    const onSubmit = handleSubmit(async (values) => {
        clearErrors();
        try {
            const res = await fetch('/api/asset-bound', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: values.assetId,
                    eventType: values.eventType,
                    toStorageId: values.toStorageId ?? undefined,
                    toRoomNumberId: values.toRoomNumberId ?? undefined,
                    notes: values.notes?.trim() || undefined,
                }),
            });

            const result = await handleApiResponse<AssetEventValues>(res, setError);

            if (result === false) return

            toast.success(result.message ?? "保存しました")
            router.push("/dashboard");

        } catch {
            toast.error("通信エラーが発生しました");
        }
    });

    const handleBack = () => router.push('/dashboard');

    return {
        // 状態
        selectedAsset, selectedEventType, isSubmitting, isValid,
        filteredAssets, needsDestination, needsRoom,
        storageOptions: storageLocations.map((s) => ({ id: s.id, label: s.label })),
        roomOptions: roomNumbers.map((r) => ({ id: r.id, label: r.label })),
        rooms: roomNumbers,
        searchName, searchCode,

        // フォーム
        register, fieldErrors: errors,

        // ハンドラ
        handleBack,
        onSelectAsset, onSelectEventType, onSubmit,
        onChangeSearchName: setSearchName,
        onChangeSearchCode: setSearchCode,
        onClearSearch,
    };
}
"use client";

import { useMemo, useState, useCallback } from "react";
import type { AssetListRow } from "@/lib/repositories/assets/getAllAssets";
import {
    DEFAULT_FILTERS,
    filterAssets,
    getTotalPages,
    hasActiveFilters,
    paginate,
    toggleId,
    type AssetInventoryFilters,
} from "@/app/(app)/asset/asset-inventory/components/AssetInventorySearchLogic";
import { toast } from "sonner";

type Props = {
    defaultAssets: AssetListRow[];
};

const LIMIT = 20;

export function useInventorySearch({ defaultAssets }: Props) {
    const [assets, setAssets] = useState<AssetListRow[]>(defaultAssets);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<AssetInventoryFilters>(DEFAULT_FILTERS);

    const filteredAssets = useMemo(() => filterAssets(assets, filters), [assets, filters]);
    const totalCount = filteredAssets.length;
    const totalPages = getTotalPages(totalCount, LIMIT);
    const assetList = useMemo(() => paginate(filteredAssets, currentPage, LIMIT), [filteredAssets, currentPage]);

    const resetPage = useCallback(() => setCurrentPage(1), []);

    const onNameChange = useCallback((value: string) => {
        setFilters((prev) => ({ ...prev, name: value }));
        setCurrentPage(1);
    }, []);

    const onCategoryChange = useCallback((id: number, checked: boolean) => {
        setFilters((prev) => ({ ...prev, categoryIds: toggleId(prev.categoryIds, id, checked) }));
        setCurrentPage(1);
    }, []);

    const onStorageChange = useCallback((id: number, checked: boolean) => {
        setFilters((prev) => ({ ...prev, storageIds: toggleId(prev.storageIds, id, checked) }));
        setCurrentPage(1);
    }, []);

    const onOwnerChange = useCallback((id: number, checked: boolean) => {
        setFilters((prev) => ({ ...prev, ownerIds: toggleId(prev.ownerIds, id, checked) }));
        setCurrentPage(1);
    }, []);

    const onRoomNumberChange = useCallback((id: number, checked: boolean) => {
        setFilters((prev) => ({ ...prev, roomNumberIds: toggleId(prev.roomNumberIds, id, checked) }));
        setCurrentPage(1);
    }, []);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages) setCurrentPage((page) => page + 1);
    }, [currentPage, totalPages]);

    const prevPage = useCallback(() => {
        if (currentPage > 1) setCurrentPage((page) => page - 1);
    }, [currentPage]);


    const onReset = useCallback(() => {
        setFilters(DEFAULT_FILTERS);
        setCurrentPage(1);
    }, []);

    const handleConfirmDelete = useCallback(async (target: AssetListRow) => {
        try {
            const res = await fetch(`/api/asset/delete/${target.id}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok || !result?.success) {
                toast.error(result?.message ?? "削除に失敗しました");
                return;
            }
            toast.success(result?.message ?? "削除しました");
            setAssets((prev) => prev.filter((a) => a.id !== target.id));

        }
        catch {
            toast.error("削除中にエラーが発生しました");
        }
    }, []);

    return {
        // 状態
        assetList,
        totalCount,
        currentPage,
        totalPages,
        isSearchOpen,
        setIsSearchOpen,
        hasActiveFilters: hasActiveFilters(filters),

        // フィルター
        name: filters.name,
        categoryIds: filters.categoryIds,
        storageIds: filters.storageIds,
        ownerIds: filters.ownerIds,
        roomNumberIds: filters.roomNumberIds,

        // ハンドラ
        nextPage,
        prevPage,
        onNameChange,
        onCategoryChange,
        onStorageChange,
        onOwnerChange,
        onRoomNumberChange,
        onReset,
        handleConfirmDelete,
    }
};
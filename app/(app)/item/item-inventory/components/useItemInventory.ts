import { useState, useMemo, useCallback } from "react";
import { GetItemResult } from "@/lib/repositories/items/getAllItemInventory";
import { toast } from "sonner";

export type StockLevel = "ok" | "low" | "critical";

export function getStockLevel(item: GetItemResult): StockLevel {
  if (item.reorderPoint !== null && item.currentStock <= item.reorderPoint) return "critical";
  if (item.parLevel !== null && item.currentStock < item.parLevel * 0.5) return "low";
  return "ok";
}

export function useItemInventory(initialItems: GetItemResult[]) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [items, setItems] = useState<GetItemResult[]>(initialItems);
  const [deleteTarget, setDeleteTarget] = useState<GetItemResult | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.status === 1) ||
        (statusFilter === "inactive" && item.status === 0);
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const hasActiveFilters = !!(search.trim() || statusFilter !== "all");

  const handleReset = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/item/delete/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result?.success) {
        toast.error(result?.message ?? "削除に失敗しました");
        return;
      }

      const targetId = deleteTarget.id;
      setDeleteTarget(null);
      setItems((prev) => prev.filter((item) => item.id !== targetId));
      toast.success(result?.message ?? "削除しました");

    } catch (error) {
      console.error("Delete submission error:", error);
      toast.error("削除中にエラーが発生しました");
    }
  }, [deleteTarget]);

  return {
    // 状態
    isSearchOpen,
    search,
    statusFilter,
    filtered,
    hasActiveFilters,
    deleteTarget,

    // ハンドラ
    setIsSearchOpen,
    onSearchChange: setSearch,
    onStatusFilterChange: setStatusFilter,
    onDeleteTargetChange: setDeleteTarget,
    handleReset,
    handleDeleteConfirm,
  };
}
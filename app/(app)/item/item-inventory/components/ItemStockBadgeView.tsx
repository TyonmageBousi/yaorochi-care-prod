'use client';

import { getStockLevel } from "./useItemInventory";
import { GetItemResult } from "@/lib/repositories/items/getAllItemInventory";

type Props = { item: GetItemResult };

export default function ItemStockBadgeView({ item }: Props) {
    const level = getStockLevel(item);
    const cfg = {
        ok: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "適正" },
        low: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400", label: "少ない" },
        critical: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "要発注" },
    }[level];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
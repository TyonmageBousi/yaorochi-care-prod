import { Package, LogOut, ClipboardList, Home, Settings, History } from "lucide-react";

type BreadcrumbItem = { label: string; href: string };

export const BREADCRUMB_MAP: Record<string, BreadcrumbItem[]> = {
    "/": [],
    "/item": [
        { label: "消耗品管理", href: "/item" },
    ],
    "/item/inbound": [
        { label: "消耗品管理", href: "/item" },
        { label: "入庫登録", href: "/item/inbound" },
    ],
    "/item/outbound": [
        { label: "消耗品管理", href: "/item" },
        { label: "払出登録", href: "/item/outbound" },
    ],
    "/item/item-inventory": [
        { label: "消耗品管理", href: "/item" },
        { label: "品目一覧", href: "/item/item-inventory" },
    ],
    "/items/item-register/new": [
        { label: "消耗品管理", href: "/item" },
        { label: "品目新規登録", href: "/items/item-register/new" },
    ],
    "/asset": [
        { label: "資産管理", href: "/asset" },
    ],
    "/asset/asset-bound": [
        { label: "資産管理", href: "/asset" },
        { label: "イベント登録", href: "/asset/asset-bound" },
    ],
    "/asset/asset-inventory": [
        { label: "資産管理", href: "/asset" },
        { label: "イベント履歴", href: "/asset/asset-inventory" },
    ],
    "/asset/asset-register/new": [
        { label: "資産管理", href: "/asset" },
        { label: "新規資産登録", href: "/asset/asset-register/new" },
    ],
    "/stock-take/select-location": [
        { label: "棚卸", href: "/stock-take/select-location" },
    ],
    "/stock-take/stock-taking": [
        { label: "棚卸", href: "/stock-take/select-location" },
        { label: "棚卸入力", href: "/stock-take/stock-taking" },
    ],
    "/stock-take/stock-inventory": [
        { label: "棚卸", href: "/stock-take/select-location" },
        { label: "棚卸確定", href: "/stock-take/stock-inventory" },
    ],
    "/room-number/resident-register": [
        { label: "施設管理", href: "/room-number/resident-register" },
        { label: "入居者登録", href: "/room-number/resident-register" },
    ],
    "/room-number/room-numbers-register": [
        { label: "施設管理", href: "/room-number/resident-register" },
        { label: "部屋登録", href: "/room-number/room-numbers-register" },
    ],
    "/admin/users": [
        { label: "管理", href: "/admin/users" },
        { label: "スタッフ管理", href: "/admin/users" },
    ],
    "/history": [
        { label: "履歴", href: "/history" },
    ],
};

export const NAV_ICONS = [
    { icon: Home, label: "ホーム", href: "/" },
    { icon: Package, label: "入庫", href: "/item/inbound" },
    { icon: LogOut, label: "出庫", href: "/item/outbound" },
    { icon: ClipboardList, label: "棚卸", href: "/stock-take/select-location" },
    { icon: Settings, label: "管理", href: "/admin/users" },
    { icon: History, label: "履歴", href: "/history" },
];

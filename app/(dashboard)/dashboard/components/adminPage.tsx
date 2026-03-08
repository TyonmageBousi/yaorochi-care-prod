import {
    Package,
    Users,
    FileText,
    List,
    PlusCircle,
    LogOut,
    DoorOpen,
    UserPlus,
    ClipboardList,
    History,
    LucideIcon
} from 'lucide-react';
import BaseDashboard from '@/app/(dashboard)/dashboard/components/baseDashboard'
import type { AssetHistoryRow } from "@/lib/repositories/assets/getAssetHistory"
import type { ItemHistoryRow } from "@/lib/repositories/items/getItemHistory"

type AdminDashboardProps = {
    userId: string
    userName: string
    facilityId: number
    assetsHistory: AssetHistoryRow[],
    itemsHistory: ItemHistoryRow[]
}

export type MenuItem = {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    hoverColor: string;
};

export default function AdminDashboard({ userId, userName, facilityId, assetsHistory, itemsHistory }: AdminDashboardProps) {

    const menuItems: MenuItem[] = [
        {
            href: '/item/inbound',
            title: '入庫登録',
            description: '消耗品の入庫数量を登録',
            icon: Package,
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:border-blue-400',
        },
        {
            href: '/item/outbound',
            title: '払出登録',
            description: '消耗品の払出数量を登録',
            icon: LogOut,
            color: 'from-orange-500 to-orange-600',
            hoverColor: 'hover:border-orange-400',
        },
        {
            href: '/item',
            title: '消耗品管理',
            description: '消耗品の一覧確認・新規登録',
            icon: List,
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:border-purple-400',
        },
        {
            href: '/asset',
            title: '資産管理',
            description: '資産の一覧確認・新規登録',
            icon: FileText,
            color: 'from-green-500 to-green-600',
            hoverColor: 'hover:border-green-400',
        },
        {
            href: '/asset/asset-bound',
            title: '資産イベント登録',
            description: '資産の移動・割り当てを登録',
            icon: PlusCircle,
            color: 'from-pink-500 to-pink-600',
            hoverColor: 'hover:border-pink-400',
        },
        {
            href: '/stock-take/select-location',
            title: '棚卸',
            description: '場所を選択して棚卸を実施',
            icon: ClipboardList,
            color: 'from-teal-500 to-teal-600',
            hoverColor: 'hover:border-teal-400',
        },
        {
            href: '/room-number/resident-register',
            title: '入居者登録',
            description: '新しい入居者を登録',
            icon: UserPlus,
            color: 'from-cyan-500 to-cyan-600',
            hoverColor: 'hover:border-cyan-400',
        },
        {
            href: '/room-number/room-numbers-register',
            title: '部屋登録',
            description: '新しい部屋を登録',
            icon: DoorOpen,
            color: 'from-yellow-500 to-yellow-600',
            hoverColor: 'hover:border-yellow-400',
        },
        {
            href: '/admin/users',
            title: 'スタッフ管理',
            description: 'スタッフの追加・権限管理',
            icon: Users,
            color: 'from-red-500 to-red-600',
            hoverColor: 'hover:border-red-400',
        },
        {
            href: '/history',
            title: '履歴',
            description: '操作履歴を確認',
            icon: History,
            color: 'from-teal-500 to-blue-600',
            hoverColor: 'hover:border-gray-400',
        },
    ];

    const baseDashboardProps = {
        userId, userName, facilityId, menuItems, assetsHistory, itemsHistory
    }

    return (
        <>
            <BaseDashboard {...baseDashboardProps} />

        </>
    )
}
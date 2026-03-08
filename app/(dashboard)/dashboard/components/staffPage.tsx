import {
    Package,
    Trash2,
    Users,
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

export default function AdminDashboard({ userId, userName, facilityId, assetsHistory, itemsHistory }: AdminDashboardProps) {

    const menuItems = [
        {
            href: '/dashboard/inventory',
            title: '備品在庫',
            description: '在庫数の確認・入出庫の管理',
            icon: Package,
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:border-blue-400',
        },
        {
            href: '/dashboard/waste-log',
            title: '払出記録',
            description: '払出の履歴と数量を確認',
            icon: Trash2,
            color: 'from-red-500 to-red-600',
            hoverColor: 'hover:border-red-400',
        },
        {
            href: '/dashboard/residents',
            title: '入居者',
            description: '入居者情報の一覧・編集',
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:border-purple-400',
        }
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
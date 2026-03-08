// app/dashboard/page.tsx
import Link from 'next/link';
import type { LucideIcon } from "lucide-react";
import { AssetHistoryRow } from "@/lib/repositories/assets/getAssetHistory";
import { ItemHistoryRow } from "@/lib/repositories/items/getItemHistory";
import { HistoryPage } from "@/app/(app)/history/components/HistoryPage"

type BaseDashboardProps = {
    menuItems: MenuItem[]
    assetsHistory: AssetHistoryRow[]
    itemsHistory: ItemHistoryRow[]
}
type MenuItem = {
    href: string,
    title: string,
    description: string,
    icon: LucideIcon,
    color: string,
    hoverColor: string,
}


export default function BaseDashboard({
    menuItems,
    assetsHistory,
    itemsHistory
}: BaseDashboardProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            {/* メインコンテンツ */}
            <div className="max-w-5xl mx-auto px-5 py-6">
                {/* ダッシュボードカード */}
                <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
                    <div className="border-b border-gray-100 pb-3 mb-4">
                        <h2 className="text-lg font-bold text-gray-900">管理メニュー</h2>
                        <p className="text-xs text-gray-500 mt-1">操作を選択してください</p>
                    </div>

                    {/* グリッドレイアウト: スマホ=1列、タブレット=2列、PC=3列 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-200 active:scale-[0.99] ${item.hoverColor} hover:shadow-md`}
                                >
                                    <div className="flex items-center p-4">
                                        {/* アイコン部分 */}
                                        <div
                                            className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}
                                        >
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>

                                        {/* テキスト部分 */}
                                        <div className="ml-4 flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-base mb-0.5">
                                                {item.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>

                                        {/* 矢印 */}
                                        <div className="flex-shrink-0 ml-2">
                                            <svg
                                                className="w-5 h-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>


                < HistoryPage assetsHistory={assetsHistory} itemsHistory={itemsHistory} />

                {/* 最下部余白 */}
                <div className="h-6"></div>
            </div>
        </div>
    );
}
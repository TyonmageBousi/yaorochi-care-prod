import { signOut } from "@/auth";
import { facilityIds } from "@/lib/constants/facilities";

type Props = {
    userName: string;
    facilityId?: number;
    userId?: string;
    subtitle?: string;
};


export default async function Header({
    userName,
    facilityId,
    userId,
    subtitle = "メニューから操作を選択してください",
}: Props) {

    const facilityLabel = facilityIds.find(facility => facility.id === Number(facilityId))?.label ?? "該当の施設が見当たりません。";


    return (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-6 shadow-lg">
            <div className="max-w-5xl mx-auto flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-90 mb-1">ダッシュボード</p>
                    <h1 className="text-2xl font-bold mb-1">
                        こんにちは、{userName}さん
                    </h1>
                    <p className="text-sm opacity-90">{subtitle}</p>

                    {(facilityId || userId) && (
                        <div className="mt-3 text-xs opacity-80 flex flex-wrap gap-x-4 gap-y-1">
                            {facilityId && <span>施設名: {facilityLabel}</span>}
                            {userId && <span>ユーザーID: {userId}</span>}
                        </div>
                    )}
                </div>

                {/* ログアウトボタン */}
                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                    }}
                >
                    <button
                        type="submit"
                        className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
                    >
                        ログアウト
                    </button>
                </form>
            </div>
        </div>
    );
}
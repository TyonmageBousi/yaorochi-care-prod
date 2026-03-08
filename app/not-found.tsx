import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-5">
            <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">

                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 mx-auto mb-6">
                    <span className="text-3xl">🔍</span>
                </div>

                <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
                <p className="text-lg font-medium text-slate-700 mb-1">ページが見つかりません</p>
                <p className="text-sm text-slate-500 mb-8">
                    URLが正しくないか、データが削除された可能性があります。
                </p>

                <Link
                    href="/dashboard"
                    className="block w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:shadow-lg active:scale-[0.98] transition-all"
                >
                    ダッシュボードへ戻る
                </Link>
            </div>
        </div>
    );
}

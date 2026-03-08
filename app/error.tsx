'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function Error({ error, reset }: Props) {
    const router = useRouter();

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-5">
            <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm text-center">

                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-6">
                    <span className="text-3xl">⚠️</span>
                </div>

                <h1 className="text-lg font-bold text-slate-800 mb-1">エラーが発生しました</h1>
                <p className="text-sm text-slate-500 mb-8">
                    しばらく時間をおいて再度お試しください。<br />
                    問題が続く場合は管理者にご連絡ください。
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        ダッシュボードへ
                    </button>
                    <button
                        onClick={reset}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm hover:shadow-lg active:scale-95 transition-all"
                    >
                        再試行
                    </button>
                </div>
            </div>
        </div>
    );
}

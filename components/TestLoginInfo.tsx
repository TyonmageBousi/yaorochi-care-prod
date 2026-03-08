export function TestLoginInfo() {
    const accounts = [
        { role: "管理者", id: "admin001", password: "password123" },
        { role: "スタッフ", id: "staff001", password: "password123" },
        { role: "マネージャー", id: "manager001", password: "password123" },
    ];

    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <p className="text-xs font-medium text-gray-400 mb-4 uppercase tracking-widest">ログイン情報</p>
                <div className="flex gap-15 divide-x divide-gray-100">
                    {accounts.map((a) => (
                        <div key={a.id} className="px-6 first:pl-0 space-y-1 ">
                            <div className="text-xs text-gray-400">{a.role}</div>
                            <div className="text-sm font-mono font-semibold text-gray-800">{a.id}</div>
                            <div className="text-sm font-mono text-gray-600">{a.password}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
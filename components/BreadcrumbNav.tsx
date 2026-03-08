"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";
import { BREADCRUMB_MAP } from "@/lib/constants/header";

export default function BreadcrumbNav() {
    const pathname = usePathname();
    const router = useRouter();
    const breadcrumbs = BREADCRUMB_MAP[pathname] ?? [];

    if (breadcrumbs.length === 0) return null;

    return (
        <div className="w-full bg-orange-100 border-b border-orange-200">
            <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2">
                <button onClick={() => router.push("/")} className="text-orange-400 hover:text-orange-600 transition-colors">
                    <Home size={18} />
                </button>
                {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-orange-300" />
                        <button
                            onClick={() => router.push(crumb.href)}
                            className={`text-sm ${i === breadcrumbs.length - 1 ? "text-orange-700 font-semibold" : "text-orange-500 hover:text-orange-700"}`}
                        >
                            {crumb.label}
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
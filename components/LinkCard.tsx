'use client';

import { useState } from "react";

type Props = {
    dispatchLabel: string;
    dispatchUrl: string;
    historyLabel: string;
    historyUrl: string;
};

type CardProps = {
    label: string;
    url: string;
    color: string;
    emoji: string;
};

function Card({ label, url, color, emoji }: CardProps) {
    const [pressed, setPressed] = useState(false);

    function handleClick() {
        setPressed(true);
        setTimeout(() => (location.href = url), 150);
    }

    return (
        <button
            onClick={handleClick}
            className={`
        w-full bg-white rounded-2xl p-5
        flex items-center gap-4
        shadow-md text-left
        transition-transform duration-150
        ${pressed ? "scale-95" : "scale-100"}
      `}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
                {emoji}
            </div>
            <span className="text-lg font-bold text-stone-800">{label}</span>
        </button>
    );
}

export default function LinkCard({ dispatchLabel, dispatchUrl, historyLabel, historyUrl }: Props) {
    return (
        <div className="min-h-dvh bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-100 flex justify-center">
            <div className="w-full max-w-md md:max-w-2xl py-4">
                <div className="px-4 flex flex-col md:flex-row gap-3">
                    <Card label={dispatchLabel} url={dispatchUrl} color="bg-orange-500" emoji="📦" />
                    <Card label={historyLabel} url={historyUrl} color="bg-violet-500" emoji="🕐" />
                </div>

            </div>
        </div>

    );
}

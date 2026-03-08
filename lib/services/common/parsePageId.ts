import { notFound } from 'next/navigation';

export function parsePageId(id: string | undefined): number {
    const n = Number(id);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) notFound();
    return n;
}
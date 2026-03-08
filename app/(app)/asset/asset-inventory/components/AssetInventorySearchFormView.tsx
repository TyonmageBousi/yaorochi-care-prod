"use client";

import { X } from "lucide-react";
import type { StorageLocationOption } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import type { RoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import type { Categories } from "@/lib/repositories/categories/getAllCategories";

type OwnerOption = {
    id: number;
    label: string;
};

type Props = {
    // 現在の入力状態（すべて controlled）
    name: string;
    categoryIds: number[];
    storageIds: number[];
    ownerIds: number[];
    roomNumberIds: number[];

    // 選択肢
    categories: Categories[];
    storageLocations: StorageLocationOption[];
    owners: OwnerOption[];
    roomNumbers: RoomNumbers[];

    // 「検索する（n件）」表示用（計算はContainer側）
    resultCount: number;

    // イベント（更新ロジックはContainer側）
    onNameChange: (v: string) => void;
    onCategoryChange: (id: number, checked: boolean) => void;
    onStorageChange: (id: number, checked: boolean) => void;
    onOwnerChange: (id: number, checked: boolean) => void;
    onRoomNumberChange: (id: number, checked: boolean) => void;

    onClose: () => void; // X
    onReset: () => void; // クリア
    onSearch: () => void; // 検索する（通常は close させる）
};

const labelStyle = "block text-base font-bold text-gray-800 mb-3";
const checkBoxStyle =
    "flex items-center gap-3 cursor-pointer hover:bg-orange-50 p-3 rounded-xl border-2 border-transparent has-[:checked]:border-orange-400 has-[:checked]:bg-orange-50 transition-all";

const closeButtonStyle = "p-2 hover:bg-white/20 rounded-lg transition-colors";
const clearButtonStyle =
    "flex-1 px-6 py-4 text-lg border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all font-bold bg-white shadow-md";
const searchButtonStyle =
    "flex-1 px-6 py-4 text-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg active:scale-[0.98] transition-all font-bold shadow-md";

function CardSection({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            {children}
        </div>
    );
}

type CheckboxListItem = { id: string | number; label: string };

function CheckboxList({
    label,
    items,
    selected,
    onChange,
}: {
    label: string;
    items: CheckboxListItem[];
    selected: Set<string>;
    onChange: (id: string, checked: boolean) => void;
}) {
    return (
        <div>
            <div className={labelStyle}>{label}</div>

            {/* 選択肢が多い前提でスクロール枠 */}
            <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2">
                {items.map((it) => {
                    const key = String(it.id);
                    const checked = selected.has(key);

                    return (
                        <label key={key} className={checkBoxStyle}>
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => onChange(key, e.target.checked)}
                                className="h-5 w-5 accent-orange-500"
                            />
                            <span className="text-sm font-bold text-gray-800">{it.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

export default function AssetInventorySearchFormView({
    name,
    categoryIds,
    storageIds,
    ownerIds,
    roomNumberIds,
    categories,
    storageLocations,
    owners,
    roomNumbers,
    resultCount,
    onNameChange,
    onCategoryChange,
    onStorageChange,
    onOwnerChange,
    onRoomNumberChange,
    onClose,
    onReset,
    onSearch,
}: Props) {
    // View内でSet化（見た目用。フィルタ本体はContainerで）
    const selectedCategory = new Set(categoryIds.map(String));
    const selectedStorage = new Set(storageIds.map(String));
    const selectedOwner = new Set(ownerIds.map(String));
    const selectedRoom = new Set(roomNumberIds.map(String));

    const categoryItems: CheckboxListItem[] = categories.map((category) => ({
        id: category.id,
        label: category.label,
    }));

    const storageItems: CheckboxListItem[] = storageLocations.map((storage) => ({
        id: storage.id,
        label: storage.label,
    }));

    const ownerItems: CheckboxListItem[] = owners.map((owner) => ({
        id: owner.id,
        label: owner.label,
    }));

    const roomItems: CheckboxListItem[] = roomNumbers.map((room) => ({
        id: room.id,
        label: room.label,
    }));

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 z-50 overflow-y-auto">
            <div className="min-h-screen p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {/* ヘッダー */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">検索条件</h3>
                                <p className="text-sm mt-1 opacity-90">条件を入力して検索</p>
                            </div>

                            <button type="button" onClick={onClose} className={closeButtonStyle}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* 商品名 */}
                    <CardSection>
                        <label className={labelStyle}>商品名</label>
                        <input
                            type="text"
                            placeholder="商品名を入力"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                        />
                    </CardSection>

                    {/* カテゴリ・保存場所（2カラム） */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <CardSection>
                            <CheckboxList
                                label="カテゴリ"
                                items={categoryItems}
                                selected={selectedCategory}
                                onChange={(id, checked) => onCategoryChange(Number(id), checked)}
                            />
                        </CardSection>

                        <CardSection>
                            <CheckboxList
                                label="保存場所"
                                items={storageItems}
                                selected={selectedStorage}
                                onChange={(id, checked) => onStorageChange(Number(id), checked)}
                            />
                        </CardSection>
                    </div>

                    {/* 所有者・部屋番号（2カラム） */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <CardSection>
                            <CheckboxList
                                label="所有者"
                                items={ownerItems}
                                selected={selectedOwner}
                                onChange={(id, checked) => onOwnerChange(Number(id), checked)}
                            />
                        </CardSection>

                        <CardSection>
                            <CheckboxList
                                label="部屋番号"
                                items={roomItems}
                                selected={selectedRoom}
                                onChange={(id, checked) => onRoomNumberChange(Number(id), checked)}
                            />
                        </CardSection>
                    </div>

                    {/* アクション（下部sticky） */}
                    <div className="flex gap-3 pt-2 sticky bottom-4">
                        <button type="button" onClick={onReset} className={clearButtonStyle}>
                            クリア
                        </button>

                        <button type="button" onClick={onSearch} className={searchButtonStyle}>
                            検索する（{resultCount}件）
                        </button>
                    </div>

                    <div className="h-4" />
                </div>
            </div>
        </div>
    );
}
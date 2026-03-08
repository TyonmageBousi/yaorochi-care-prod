'use client';
import { FieldArrayWithId } from "react-hook-form";
import { OutBoundValues } from "@/lib/validations/outBound";
import { ItemOptionWithStock } from "@/lib/repositories/items/getAllItems";

type Props = {
    items: ItemOptionWithStock[];
    fields: FieldArrayWithId<OutBoundValues, "rows", "id">[];
    onAddItem: (itemId: number) => void;
    onClose: () => void;
};

const selectedStyle = "border-green-500 bg-green-50";
const unselectedStyle = "border-gray-200 hover:border-orange-400 hover:shadow-lg";
const closeButtonStyle = "text-gray-400 hover:text-gray-600 text-3xl leading-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition";

function ItemThumbnail({ imageUrl, name }: { imageUrl?: string | null; name: string }) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className="w-full h-32 object-cover rounded-lg mb-3"
            />
        );
    }
    return (
        <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
            <span className="text-5xl">📦</span>
        </div>
    );
}

export default function OutBoundItemListSelectView({ items, fields, onAddItem, onClose }: Props) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* モーダルヘッダー */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex items-center justify-between z-10">
                    <h3 className="text-xl font-bold text-gray-800">商品を選択</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={closeButtonStyle}
                        aria-label="閉じる"
                    >
                        ×
                    </button>
                </div>

                {/* 商品グリッド */}
                <div className="grid grid-cols-2 gap-4 p-5">
                    {items.length === 0 ? (
                        /* 商品が存在しない場合 */
                        <div className="col-span-2 py-14 text-center">
                            <div className="text-5xl mb-3">📭</div>
                            <p className="text-base font-bold text-gray-800">商品がありません</p>
                            <p className="text-sm text-gray-500 mt-1">先に商品を登録してください。</p>
                        </div>
                    ) : items.map((item) => {
                        const isSelected = fields.some(field => field.itemId === item.id);
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onAddItem(item.id)}
                                className={`p-4 border-2 rounded-xl text-left transition-all active:scale-95 ${isSelected ? selectedStyle : unselectedStyle}`}
                            >
                                {/* サムネイル */}
                                <ItemThumbnail imageUrl={item.imageUrl} name={item.name} />

                                {/* 商品情報 */}
                                <div className="font-bold text-base mb-1">{item.name}</div>
                                <div className="text-sm text-gray-600">
                                    在庫: <span className="font-bold text-green-600">{item.currentStockQty}</span>
                                </div>

                                {/* 選択中バッジ */}
                                {isSelected && (
                                    <div className="text-xs text-green-600 font-bold mt-2">✓ 選択中</div>
                                )}
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
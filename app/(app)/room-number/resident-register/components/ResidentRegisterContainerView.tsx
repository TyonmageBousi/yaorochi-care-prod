'use client';
import { useResidentRegister } from "./useResidentRegister";
import ResidentCardFormView from "./ResidentCardFormView";
import { RoomResidentName } from "@/lib/repositories/roomNumbers/getAllRoomResidentName";
import SubmitButton from "@/components/SubmitButton";

type Props = {
    rooms: RoomResidentName[];
};

const addButtonStyle = "w-full bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-base mb-4 disabled:opacity-50";

export default function ResidentRegisterContainerView({ rooms }: Props) {
    const {
        // 状態
        isSubmitting,
        isValid,
        fields,
        watchedRows,
        usedRoomIds,
        filledCount,
        remainingRooms,
        // フォーム
        register,
        errors,
        // ハンドラ
        onSubmit,
        handleAdd,
        handleRemove,
        handleBack,
        handleRoomChange
    } = useResidentRegister(rooms);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 pb-10">
            <div className="max-w-3xl mx-auto px-5 py-6">

                {/* ページヘッダー */}
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-5 shadow-lg mb-6">
                    <div className="max-w-xl mx-auto">
                        <p className="text-sm opacity-80">管理者用</p>
                        <h1 className="text-2xl font-black mt-0.5">入居者名 一括登録</h1>
                        <p className="text-sm opacity-80 mt-1">部屋を選んで入居者名を入力してください</p>
                    </div>
                </div>

                <form onSubmit={onSubmit}>

                    {/* 案内メッセージ */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                        <div className="text-sm text-orange-800 font-bold mb-1">🏠 登録する入居者を追加</div>
                        <div className="text-xs text-orange-700">複数の入居者をまとめて登録できます。</div>
                    </div>

                    {/* 行追加ボタン */}
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={remainingRooms === 0}
                        className={addButtonStyle}
                    >
                        ＋ 入居者を追加
                        {remainingRooms === 0 && (
                            <span className="ml-2 text-xs font-normal opacity-80">（全部屋選択済み）</span>
                        )}
                    </button>

                    {/* カード一覧 */}
                    {fields.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            まだ入居者が追加されていません
                        </div>
                    ) : (
                        <div className="space-y-3 mb-4">
                            {fields.map((field, index) => {
                                // この行の現在の roomId を数値に変換
                                const currentRoomId = Number(watchedRows?.[index]?.roomId ?? "");

                                // 自分以外の選択済み roomId を除外
                                const filteredUsedRoomIds = usedRoomIds.filter(id => id !== currentRoomId);

                                return (
                                    <ResidentCardFormView
                                        key={field.id}
                                        field={field}
                                        index={index}
                                        rooms={rooms}
                                        usedRoomIds={filteredUsedRoomIds}
                                        register={register}
                                        errors={errors}
                                        watchedRoomId={currentRoomId}
                                        onRemove={handleRemove}
                                        onRoomChange={handleRoomChange}

                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* 送信ボタン */}
                    <SubmitButton
                        isFormValid={isValid}
                        isSubmitting={isSubmitting}
                        onBack={handleBack}
                    />

                </form>

            </div>
        </div>
    );
}
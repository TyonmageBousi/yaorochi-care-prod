'use client';

import { useMemo } from "react";
import { FieldArrayWithId, UseFormRegister, FieldErrors } from "react-hook-form";
import TextForm, { FieldTextProps } from "@/components/form/TextForm";
import OptionsForm, { FiledOptionsProps } from "@/components/form/OptionsForm";
import { RoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import { ResidentValues } from "@/lib/validations/residentRegister";

type Props = {
    field: FieldArrayWithId<ResidentValues, "rows", "id">;
    index: number;
    rooms: RoomNumbers[];
    usedRoomIds: number[];
    register: UseFormRegister<ResidentValues>;
    errors: FieldErrors<ResidentValues>;
    watchedRoomId: number;
    onRemove: (index: number) => void;
    onRoomChange: (index: number, roomId: string) => void;
};

const inputCls = "w-full px-3 py-2.5 border-2 border-orange-200 rounded-lg focus:border-orange-400 focus:outline-none text-base bg-white";
const labelCls = "block text-sm font-bold text-gray-700 mb-1";
const removeButtonStyle = "ml-auto text-gray-400 hover:text-red-500 transition";

export default function ResidentCardFormView({ field, index, rooms, usedRoomIds, register, errors, watchedRoomId, onRemove, onRoomChange }: Props) {

    const available = useMemo(
        () => rooms.filter(room => !usedRoomIds.includes(room.id) || room.id === watchedRoomId),
        [rooms, usedRoomIds, watchedRoomId]
    );

    const selectedRoom = useMemo(
        () => rooms.find(room => room.id === watchedRoomId),
        [rooms, watchedRoomId]
    );

    const roomProps: FiledOptionsProps<ResidentValues> = {
        label: "部屋番号",
        labelStyle: labelCls,
        name: `rows.${index}.roomId`,
        register,
        inputStyle: inputCls,
        options: [
            { id: 0, label: "選択してください" },
            ...available.map((room) => ({ id: room.id, label: `${room.label}号室` })),
        ],
        errors,
        onChange: (value) => onRoomChange(index, value),
    };

    const nameProps: FieldTextProps<ResidentValues> = {
        label: "入居者名",
        labelStyle: labelCls,
        name: `rows.${index}.residentName`,
        register,
        inputStyle: inputCls,
        placeholder: "例: 山田 花子",
        errors,
    };

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">

            {/* カードヘッダー：選択中の部屋・削除ボタン */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-orange-500 font-bold text-base">
                    {selectedRoom ? `${selectedRoom.label}号室` : "🚪 未選択"}
                </span>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className={removeButtonStyle}
                    aria-label="削除"
                >
                    ×
                </button>
            </div>

            {/* フォーム入力欄 */}
            <div className="space-y-3">
                <OptionsForm props={roomProps} />
                <TextForm props={nameProps} />
            </div>

        </div>
    );
}
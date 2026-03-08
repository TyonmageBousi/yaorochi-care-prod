'use client';

import type { EventType } from '@/lib/constants/eventTypes';
import type { AssetEventValues } from '@/lib/validations/assetEventSchema';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import OptionsForm, { FiledOptionsProps, Options } from '@/components/form/OptionsForm';
import TextAreaForm, { FieldTextAreaProps } from '@/components/form/TextAreaForm';
import { StorageLocationOption } from '@/lib/repositories/storageLocations/getAllStorageLocations';
import { EVENT_TYPES } from '../../../../../lib/constants/eventTypes';

interface EventTypeSelectorProps {
  selectedEventType: EventType | null;
  needsDestination: boolean;
  needsRoom: boolean;
  storageOptions: readonly StorageLocationOption[];
  roomOptions: readonly Options[];
  register: UseFormRegister<AssetEventValues>;
  fieldErrors: FieldErrors<AssetEventValues>;
  onSelectEventType: (type: EventType) => void;
}

// ラベルと入力欄の共通スタイル
const labelStyle = 'block text-sm font-semibold text-gray-700 mb-2 border-b border-orange-100 pb-2';
const inputStyle = 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors text-sm md:text-base bg-white';

export default function AssetBoundEventFormView({
  selectedEventType,
  needsDestination,
  needsRoom,
  storageOptions,
  roomOptions,
  register,
  fieldErrors,
  onSelectEventType,
}: EventTypeSelectorProps) {
  // 選択中のイベント情報（アイコン・ラベルの表示に使う）
  const selected = EVENT_TYPES.find((e) => e.type === selectedEventType);

  // 保管場所セレクトのプロパティ
  const storageProps: FiledOptionsProps<AssetEventValues> = {
    label: '保管場所',
    labelStyle,
    name: 'toStorageId',
    register,
    inputStyle,
    options: storageOptions,
    errors: fieldErrors,
  };

  // 居室セレクトのプロパティ
  const roomProps: FiledOptionsProps<AssetEventValues> = {
    label: '居室',
    labelStyle,
    name: 'toRoomNumberId',
    register,
    inputStyle,
    options: roomOptions,
    errors: fieldErrors,
  };

  // 備考テキストエリアのプロパティ
  const notesProps: FieldTextAreaProps<AssetEventValues> = {
    label: '備考',
    labelStyle,
    name: 'notes',
    register,
    inputStyle: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 transition-colors resize-none text-sm md:text-base',
    rows: 3,
    placeholder: '必要に応じて詳細を記入してください',
    errors: fieldErrors,
  };

  return (
    <div className="flex flex-col gap-4">

      {/* 操作ボタングリッド */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100">
        <div className="px-4 pt-4 pb-2 border-b border-orange-100">
          <h2 className="text-sm font-semibold text-gray-700">操作を選択</h2>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {EVENT_TYPES.map((event) => (
            <button
              key={event.type}
              type="button"
              onClick={() => onSelectEventType(event.type)}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium transition-all bg-gradient-to-br ${selectedEventType === event.type
                  ? `from-${event.color}-50 to-${event.color}-100 border-2 border-${event.color}-300 text-${event.color}-700`
                  : 'from-gray-50 to-gray-100 border-2 border-transparent text-gray-600 hover:from-orange-50 hover:to-amber-50 hover:border-orange-200'
                }`}
            >
              <i className={`fas ${event.icon} text-base flex-shrink-0 ${selectedEventType === event.type ? `text-${event.color}-500` : 'text-gray-400'
                }`} />
              {event.label}
            </button>
          ))}
        </div>
      </div>

      {/* 選択中の操作を表示 */}
      {selected && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <i className={`fas ${selected.icon} text-xl text-orange-500 flex-shrink-0`} />
          <div>
            <p className="text-xs font-semibold text-orange-500">✓ 選択中の操作</p>
            <p className="font-bold text-gray-800">{selected.label}</p>
          </div>
        </div>
      )}

      {/* 保管場所（MOVE / UNASSIGN_ROOM のときのみ表示） */}
      {needsDestination && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100 p-4">
          <OptionsForm props={storageProps} />
        </div>
      )}

      {/* 居室（ASSIGN_ROOM のときのみ表示） */}
      {needsRoom && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100 p-4">
          <OptionsForm props={roomProps} />
        </div>
      )}

      {/* 備考（常に表示） */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100 p-4">
        <TextAreaForm props={notesProps} />
      </div>

    </div>
  );
}
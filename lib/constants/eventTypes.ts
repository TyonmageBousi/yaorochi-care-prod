import { ASSET_EVENT_TYPE } from '@/db/schema';

// ========================================
// UI表示用配列（フォーム用）
// ========================================

export const EVENT_TYPES = [
  { type: ASSET_EVENT_TYPE.MOVE, label: '移動', icon: 'fa-exchange-alt', color: 'purple' },
  { type: ASSET_EVENT_TYPE.ASSIGN_ROOM, label: '居室割当', icon: 'fa-door-open', color: 'green' },
  { type: ASSET_EVENT_TYPE.UNASSIGN_ROOM, label: '割当解除', icon: 'fa-door-closed', color: 'amber' },
  { type: ASSET_EVENT_TYPE.MAINTENANCE, label: '点検', icon: 'fa-clipboard-check', color: 'cyan' },
  { type: ASSET_EVENT_TYPE.REPAIR, label: '修理', icon: 'fa-wrench', color: 'indigo' },
  { type: ASSET_EVENT_TYPE.RETIRE, label: '廃棄', icon: 'fa-trash', color: 'red' },
] as const;

export type EventTypeEntry = (typeof EVENT_TYPES)[number];
export type EventType = EventTypeEntry['type'];
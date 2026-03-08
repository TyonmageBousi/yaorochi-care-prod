import { z } from "zod";
import { ASSET_EVENT_TYPE } from "@/db/schema";

// イベントタイプの許容値
export const assetEventTypeSchema = z.union([
    z.literal(ASSET_EVENT_TYPE.MOVE),
    z.literal(ASSET_EVENT_TYPE.ASSIGN_ROOM),
    z.literal(ASSET_EVENT_TYPE.UNASSIGN_ROOM),
    z.literal(ASSET_EVENT_TYPE.MAINTENANCE),
    z.literal(ASSET_EVENT_TYPE.REPAIR),
    z.literal(ASSET_EVENT_TYPE.RETIRE),
], { message: "イベント種別を選択してください" });

export type EventType = z.infer<typeof assetEventTypeSchema>;

const assetEventBaseSchema = z.object({
    assetId: z.number().int().min(1, "商品を選択してください"),
    eventType: assetEventTypeSchema,
    toStorageId: z.string().optional(),
    toRoomNumberId: z.string().optional(),
    notes: z.string().optional(),
});

// 前後空白除去、空文字はundefined
const norm = (s?: string) => (s?.trim() ? s.trim() : undefined);
// 正の整数文字列かどうか
const isPosIntStr = (s: string) => /^[1-9]\d*$/.test(s);

const refineAssetEvent = (
    v: z.infer<typeof assetEventBaseSchema>,
    ctx: z.RefinementCtx
) => {
    // MOVE / UNASSIGN_ROOM は保管場所が必須
    const needsDestination = v.eventType === ASSET_EVENT_TYPE.MOVE || v.eventType === ASSET_EVENT_TYPE.UNASSIGN_ROOM;
    // ASSIGN_ROOM は居室が必須
    const needsRoom = v.eventType === ASSET_EVENT_TYPE.ASSIGN_ROOM;
    const storage = norm(v.toStorageId);
    const room = norm(v.toRoomNumberId);

    if (storage && !isPosIntStr(storage)) {
        ctx.addIssue({ code: "custom", path: ["toStorageId"], message: "保管場所が不正です。" });
    }
    if (room && !isPosIntStr(room)) {
        ctx.addIssue({ code: "custom", path: ["toRoomNumberId"], message: "居室IDが不正です。" });
    }
    if (storage && room) {
        ctx.addIssue({ code: "custom", path: ["toStorageId"], message: "保管場所と居室は同時に指定できません" });
        ctx.addIssue({ code: "custom", path: ["toRoomNumberId"], message: "保管場所と居室は同時に指定できません" });
    }
    if (needsDestination && !storage) {
        ctx.addIssue({ code: "custom", path: ["toStorageId"], message: "保管場所を選択してください" });
    }
    if (needsRoom && !room) {
        ctx.addIssue({ code: "custom", path: ["toRoomNumberId"], message: "居室を選択してください" });
    }
};

// フロント用
export const assetEventFormSchema = assetEventBaseSchema.superRefine(refineAssetEvent);
export type AssetEventValues = z.infer<typeof assetEventFormSchema>;
export type AssetEventKey = keyof AssetEventValues;

// サーバー用（文字列IDを数値に変換）
export const assetEventRequestSchema = assetEventFormSchema.transform((v) => {
    const toStorageId = norm(v.toStorageId);
    const toRoomNumberId = norm(v.toRoomNumberId);
    return {
        assetId: v.assetId,
        eventType: v.eventType,
        toStorageId: toStorageId ? Number(toStorageId) : undefined,
        toRoomNumberId: toRoomNumberId ? Number(toRoomNumberId) : undefined,
        notes: norm(v.notes),
    };
});
export type AssetEventRequest = z.infer<typeof assetEventRequestSchema>;
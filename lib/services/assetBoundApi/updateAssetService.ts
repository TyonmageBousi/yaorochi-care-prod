
import { AssetEventRequest } from "@/lib/validations/assetEventSchema";
import { ASSET_STATUS,ASSET_EVENT_TYPE } from "@/db/schema";

export async function updateAssetService(data: AssetEventRequest) {


    switch (data.eventType) {
        case ASSET_EVENT_TYPE.MOVE: 
            return {
                currentStorageId: data.toStorageId!,
                roomNumberId: null,
                status: ASSET_STATUS.IN_STORAGE,
            };
        case ASSET_EVENT_TYPE.ASSIGN_ROOM: 
            return {
                roomNumberId: data.toRoomNumberId!,
                status: ASSET_STATUS.IN_USE,
            };
        case ASSET_EVENT_TYPE.UNASSIGN_ROOM: 
            return {
                currentStorageId: data.toStorageId!,
                roomNumberId: null,
                status: ASSET_STATUS.IN_STORAGE,
            };
        case ASSET_EVENT_TYPE.REPAIR: 
        case ASSET_EVENT_TYPE.MAINTENANCE: 
            return {
                status: ASSET_STATUS.MAINTENANCE,
            };
        case ASSET_EVENT_TYPE.RETIRE: 
            return {
                roomNumberId: null,
                status: ASSET_STATUS.RETIRED,
            };
        default:
            throw new Error(`Unknown eventType: ${data.eventType}`);
    }

}

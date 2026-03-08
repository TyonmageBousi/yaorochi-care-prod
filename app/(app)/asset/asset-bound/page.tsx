import AssetEventForm from "@/app/(app)/asset/asset-bound/components/AssetBoundContainerView";
import { getAllAssets } from "@/lib/repositories/assets/getAllAssets"
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { getRoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers"
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';

export default async function AssetEventPage() {
    const user = await requireUserForPage();
    const  facilityId  = user.facilityId;

    const [assetAllOptions, storageLocations, roomNumbers] = await Promise.all([
        getAllAssets(facilityId),
        getAllStorageLocations(facilityId),
        getRoomNumbers(facilityId),
    ]);

    return (
        <>
            <AssetEventForm
                assetAllOptions={assetAllOptions}
                storageLocations={storageLocations}
                roomNumbers={roomNumbers}
            />
        </>
    );
}
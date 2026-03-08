import AssetInventoryContainer from "@/app/(app)/asset/asset-inventory/components/AssetInventoryContainerView";
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { getRoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import { getAllAssets } from "@/lib/repositories/assets/getAllAssets";
import { getAllCategories } from "@/lib/repositories/categories/getAllCategories";
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';


export default async function InventoryPage() {

    const user = await requireUserForPage();
    const facilityId = user.facilityId;

    const [assets, storageLocations, roomNumbers, categories] = await Promise.all([
        getAllAssets(facilityId),
        getAllStorageLocations(facilityId),
        getRoomNumbers(facilityId),
        getAllCategories(facilityId),
    ]);

    return (
        <AssetInventoryContainer
            assets={assets}
            storageLocations={storageLocations}
            roomNumbers={roomNumbers}
            categories={categories}
        />
    );
}

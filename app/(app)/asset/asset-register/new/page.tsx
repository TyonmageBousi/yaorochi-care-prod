import CareAssetForm from "@/app/(app)/asset/asset-register/components/AssetRegisterContainerView";
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { getRoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import { getAllCategories } from "@/lib/repositories/categories/getAllCategories"
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';

export default async function NewAssetRegisterPage() {

    const user = await requireUserForPage();
    const facilityId = user.facilityId;

    const [storageLocations, roomNumbers, categories] = await Promise.all([
        getAllStorageLocations(facilityId),
        getRoomNumbers(facilityId),
        getAllCategories(facilityId),
    ]);

    return (
        <CareAssetForm
            storageLocations={storageLocations}
            roomNumbers={roomNumbers}
            categories={categories}
        />
    );
}

import CareAssetForm from "@/app/(app)/asset/asset-register/components/AssetRegisterContainerView";
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { getRoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import { getAsset } from "@/lib/repositories/assets/getAsset";
import { mapAssetToFormDefaultValues } from "@/lib/services/common/formatFormData";
import { getAllCategories } from "@/lib/repositories/categories/getAllCategories"
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';
import { parsePageId } from "@/lib/services/common/parsePageId"
import { notFound } from 'next/navigation';

export default async function NewAssetRegisterPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireUserForPage();
    const facilityId = user.facilityId;
    const { id } = await params;
    const assetId = parsePageId(id);


    const [storageLocations, roomNumbers, categories, asset] = await Promise.all([
        getAllStorageLocations(facilityId),
        getRoomNumbers(facilityId),
        getAllCategories(facilityId),
        getAsset(facilityId, assetId),
    ]);

    if (!asset) notFound();
    const defaultData = mapAssetToFormDefaultValues(asset);


    return (
        <CareAssetForm
            storageLocations={storageLocations}
            roomNumbers={roomNumbers}
            categories={categories}
            defaultData={defaultData}
            assetId={assetId}
        />
    );
}

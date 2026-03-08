import ItemFormContainerView from "@/app/(app)/item/item-register/components/itemFormContainerView";
import { findItemByFacilityAndId } from "@/lib/repositories/items/findItemByFacilityAndId";
import { mapItemToFormDefaultValues } from "@/lib/services/common/formatFormData";
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';
import { parsePageId } from '@/lib/services/common/parsePageId';
import { notFound } from 'next/navigation';

export default async function UpdateItemRegisterPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireUserForPage();
    const facilityId = user.facilityId;

    const { id } = await params;
    const itemId = parsePageId(id);

    const existingItem = await findItemByFacilityAndId(facilityId, itemId)

    if (!existingItem) notFound();
    const formDefaultValues = mapItemToFormDefaultValues(existingItem);

      console.log(formDefaultValues);


    return (
        <ItemFormContainerView
            defaultData={formDefaultValues}
            itemId={itemId}
        />
    );
}
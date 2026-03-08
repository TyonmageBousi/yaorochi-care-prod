import ItemFormContainerView from "@/app/(app)/item/item-register/components/itemFormContainerView";
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';

export default async function NewItemRegisterPage() {

    const user = await requireUserForPage();
    return (
        <ItemFormContainerView />
    );
}
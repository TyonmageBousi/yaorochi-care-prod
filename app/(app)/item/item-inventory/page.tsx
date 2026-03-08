import ItemInventoryContainerView from './components/ItemInventoryContainerView';
import { getAllItemInventory } from "@/lib/repositories/items/getAllItemInventory"
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';

export default async function ItemsListPage() {

  const user = await requireUserForPage();

  const facilityId = user.facilityId

  const data = await getAllItemInventory(facilityId)

  return <ItemInventoryContainerView allItems={data} />;
}

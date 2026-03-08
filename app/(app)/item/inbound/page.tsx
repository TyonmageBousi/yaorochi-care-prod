import InBoundFormContainerView from "./components/InBoundFormContainerView";
import { getItemOptionsWithStock } from "@/lib/repositories/items/getAllItems"
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { requireUserForPage } from "@/lib/services/auth/requireUserForPage";

export default async function StockInPage() {
  const user = await requireUserForPage();
  const facilityId = user.facilityId;

  const [itemOptions, storageLocations] = await Promise.all([
    getItemOptionsWithStock(facilityId),
    getAllStorageLocations(facilityId),
  ]);

  return (
    <InBoundFormContainerView
      itemOptions={itemOptions}
      storageLocations={storageLocations}
    />
  );
}
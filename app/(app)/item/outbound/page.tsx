import OutBoundFormContainerView from "./components/OutBoundFormContainerView";
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations";
import { getItemOptionsWithStock } from "@/lib/repositories/items/getAllItems";
import { getRoomNumbers } from "@/lib/repositories/roomNumbers/getRoomNumbers";
import { requireUserForPage } from "@/lib/services/auth/requireUserForPage";

export default async function PayoutPage() {
  const user = await requireUserForPage();
  const facilityId = user.facilityId;

  const [items, storages, rooms] = await Promise.all([
    getItemOptionsWithStock(facilityId),
    getAllStorageLocations(facilityId),
    getRoomNumbers(facilityId),
  ]);

  return (
    <OutBoundFormContainerView
      items={items}
      storages={storages}
      rooms={rooms}
    />
  );
}
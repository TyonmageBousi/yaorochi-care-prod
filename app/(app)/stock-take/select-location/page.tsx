import NewStockTakeFormView from "@/app/(app)/stock-take/select-location/components/NewStockTakeFormView"
import { getAllStorageLocations } from "@/lib/repositories/storageLocations/getAllStorageLocations"
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';

export default async function NewStockTakePage() {

  const user = await requireUserForPage();
  const facilityId = user.facilityId;

  const storages = await getAllStorageLocations(facilityId);

  return (<NewStockTakeFormView
    storages={storages}
  />
  )
}

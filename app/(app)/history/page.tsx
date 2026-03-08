import { HistoryPage } from "@/app/(app)/history/components/HistoryPage";
import { requireUserForPage } from "@/lib/services/auth/requireUserForPage";
import { getAssetHistory } from "@/lib/repositories/assets/getAssetHistory";
import { getItemHistory } from "@/lib/repositories/items/getItemHistory";

export default async function HistoryPageRoute() {
    const user = await requireUserForPage();

    const [assetsHistory, itemsHistory] = await Promise.all([
        getAssetHistory(user.facilityId),
        getItemHistory(user.facilityId),
    ]);

    return (
        <HistoryPage
            assetsHistory={assetsHistory}
            itemsHistory={itemsHistory}
        />
    );
}

import AdminDashboard from "@/app/(dashboard)/dashboard/components/adminPage";
import OfficeDashboard from "@/app/(dashboard)/dashboard/components/officePage";
import StaffDashboard from "@/app/(dashboard)/dashboard/components/staffPage";
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';
import { getAssetHistory } from "@/lib/repositories/assets/getAssetHistory"
import { getItemHistory } from "@/lib/repositories/items/getItemHistory"
import { redirect } from "next/navigation";

export default async function DashboardPage() {

    const user = await requireUserForPage();

    const assetsHistory = await getAssetHistory(user.facilityId, 5);
    const itemsHistory = await getItemHistory(user.facilityId, 5)

    const dashboardProps = {
        userId: user.userId,
        userName: user.name,
        facilityId: user.facilityId,
        assetsHistory: assetsHistory,
        itemsHistory: itemsHistory,
    };



    switch (user.role) {
        case 1:
            return <AdminDashboard {...dashboardProps} />;
        case 2:
            return <OfficeDashboard {...dashboardProps} />;
        case 3:
            return <StaffDashboard {...dashboardProps} />;
        default: redirect('/login');

    }
}








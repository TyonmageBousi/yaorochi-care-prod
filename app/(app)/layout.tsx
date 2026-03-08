import { requireUserForPage } from "@/lib/services/auth/requireUserForPage";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import Header from "@/components/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await requireUserForPage();

    return (
        <>
            <Header
                userName={user.name}
                facilityId={user.facilityId}
                userId={user.userId}
            />
            <BreadcrumbNav />
            {children}
        </>
    );
}
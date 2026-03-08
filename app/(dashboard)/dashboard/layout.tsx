import Header from "@/components/Header";
import { requireUserForPage } from "@/lib/services/auth/requireUserForPage"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

    const user = await requireUserForPage();


   return (
    <>
        <Header
            userName={user.name}
            facilityId={user.facilityId}
            userId={user.userId}
        />
        {children}
    </>
);
}
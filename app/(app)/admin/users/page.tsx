import NewStaffRegisterView from "@/app/(app)/admin/users/components/NewStaffRegisterView";
import { requireUserForPage } from "@/lib/services/auth/requireUserForPage";
import { ROLE } from "@/db/schema";

export default async function DashboardPage() {
    await requireUserForPage([ROLE.ADMIN]);
    return (
        <NewStaffRegisterView />
    )
}
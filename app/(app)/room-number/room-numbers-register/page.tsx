
import RoomNumberFormView from "@/app/(app)/room-number/room-numbers-register/components/RoomNumberFormView";
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';

export default async function RoomNumbersPage() {

    await requireUserForPage();
    return (
        <>
            <RoomNumberFormView />
        </>
    );
}
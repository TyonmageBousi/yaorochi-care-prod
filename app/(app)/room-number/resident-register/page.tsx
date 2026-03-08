
import { getAllRoomResidentName } from "@/lib/repositories/roomNumbers/getAllRoomResidentName";
import ResidentRegisterContainerView from "@/app/(app)/room-number/resident-register/components/ResidentRegisterContainerView"
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';

export default async function ResidentBulkRegisterPage() {

    const user = await requireUserForPage();

    const facilityId = user.facilityId;
    const rooms = await getAllRoomResidentName(facilityId);

    return (
        <>
            <ResidentRegisterContainerView rooms={rooms} />
        </>
    );
}
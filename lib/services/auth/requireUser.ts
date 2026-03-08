import { auth } from "@/auth";
import { BusinessValidationError } from "@/types/handleApiErrorType";

export type AuthUser = {
    id: number;
    name: string;
    userId: string;
    role: number;
    facilityId: number;
};
export async function requireUser(): Promise<AuthUser> {
    const session = await auth();

    if (!session?.user?.id) {
        throw new BusinessValidationError("ログインしてください", 401, "UNAUTHORIZED");
    }

    return session.user as AuthUser;
}
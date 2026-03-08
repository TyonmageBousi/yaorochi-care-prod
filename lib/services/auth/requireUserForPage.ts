import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type AuthUser = {
    id: number;
    name: string;
    userId: string;
    role: number;
    facilityId: number;
};

export async function requireUserForPage(allowedRoles?: number[]): Promise<AuthUser> {
    const session = await auth();
    if (!session) redirect('/login');
    
    const user = session.user;
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        redirect('/dashboard');
    }
    
    return user;
}
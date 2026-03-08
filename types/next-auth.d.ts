import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "@auth/core/adapters" {
    interface AdapterUser {
        id: number;
        userId: string;
        role: number;
        facilityId: number;
    }
}

declare module "next-auth" {
    interface User {
        id: number;
        userId: string;
        role: number;
        facilityId: number;
    }

    interface Session {
        user: {
            id: number;
            name: string;
            userId: string;
            role: number;
            facilityId: number;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: number;
        userId?: string;
        role?: number;
        facilityId?: number;
    }
}
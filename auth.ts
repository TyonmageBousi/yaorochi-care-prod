import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                userId: { label: "UserId", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.userId || !credentials?.password) {
                    console.warn("[auth] missing credentials");
                    return null;
                }

                const user = await db.query.users.findFirst({
                    where: eq(users.userId, credentials.userId as string),
                });

                if (!user) {
                    console.warn("[auth] user not found:", credentials.userId);
                    return null;
                }

                if (!user.isActive) {
                    console.warn("[auth] inactive user:", credentials.userId);
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.passwordHash
                );

                if (!isValid) {
                    console.warn("[auth] invalid password for:", credentials.userId);
                    return null;
                }

                return {
                    id: user.id,
                    userId: user.userId,
                    name: user.name,
                    role: user.role,
                    facilityId: user.facilityId,
                };
            },
        }),
    ],
    pages: { signIn: "/login" },
    session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id as number;
                token.userId = user.userId;
                token.role = user.role;
                token.name = user.name;
                token.facilityId = user.facilityId;
            }

            return token;
        },
        async session({ session, token }) {
            if (!token.id) {
                return {} as any;
            }
            return {
                ...session,
                user: {
                    id: token.id,
                    userId: token.userId,
                    role: token.role,
                    name: token.name,
                    facilityId: token.facilityId,
                },
            };
        },
    },
});
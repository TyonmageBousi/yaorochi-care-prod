import { db } from "@/db/index";
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { StaffRegisterRequest } from "@/lib/validations/newStaff";

export async function existsStaffId(staffId: string) {
    return db
        .select()
        .from(users)
        .where(eq(users.userId, staffId))
        .limit(1)
        .then((rows) => rows.length > 0);
}

export async function insertStaff(facilityId: number, newStaff: StaffRegisterRequest) {
    const hashedPassword = await bcrypt.hash(newStaff.password, 10);

    await db.insert(users).values({
        userId: newStaff.userId,
        name: newStaff.name,
        passwordHash: hashedPassword,
        role: newStaff.role,
        isActive: true,
        facilityId,
        phone: newStaff.phone,
        hireDate: newStaff.hireDate,
    });
}
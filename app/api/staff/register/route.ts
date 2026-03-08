import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db/index";
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { staffRegisterRequestSchema } from "@/lib/validations/newStaff";
import { buildFieldErrors } from "@/lib/services/common/handleZodErrors"
import { handleApiError } from "@/lib/services/common/handleApiError";
import { requireUser } from "@/lib/services/auth/requireUser"

export async function POST(request: NextRequest) {
    try {
        // 認証チェック
        const sessionUser = await requireUser();

        // バリデーション
        const body = await request.json();
        const validation = staffRegisterRequestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, code: "VALIDATION", message: 'バリデーションエラー', details: buildFieldErrors(validation.error.issues) },
                { status: 400 }
            );
        }

        const { userId, name, password, role, phone, hireDate } = validation.data;
        
        // スタッフIDの重複チェック
        const isUserIdTaken = await db
            .select()
            .from(users)
            .where(eq(users.userId, userId))
            .limit(1)
            .then((rows) => rows.length > 0);

        if (isUserIdTaken) {
            return NextResponse.json(
                { success: false, code: "ALREADY_EXISTS", message: 'このスタッフIDは既に使用されています' },
                { status: 409 }
            );
        }

        // パスワードハッシュ化 → スタッフ登録
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.insert(users).values({
            userId,
            name,
            passwordHash: hashedPassword,
            role: role,
            isActive: true,
            facilityId: sessionUser.facilityId,
            phone,
            hireDate,
        });

        return NextResponse.json(
            { success: true, message: 'スタッフを登録しました' },
            { status: 201 }
        );

    } catch (error) {
        return handleApiError(error);
    }
}
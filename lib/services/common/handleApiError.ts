import { BusinessValidationError } from "@/types/handleApiErrorType";
import { NextResponse } from "next/server";

export function handleApiError(error: unknown) {
    console.error(error);

    if (error instanceof BusinessValidationError) {
        return NextResponse.json(
            {
                success: false,
                code: error.code,
                message: error.message,
                ...(error.details && { details: error.details }),
            },
            { status: error.status }
        );
    }

    return NextResponse.json(
        { success: false, code: "SERVER_ERROR", message: "サーバーエラーが発生しました" },
        { status: 500 }
    );
}
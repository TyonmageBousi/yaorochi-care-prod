import { toast } from "sonner";
import type { FieldValues, UseFormSetError, Path } from "react-hook-form";

type ApiSuccessBody = {
    success: true;
    message?: string;
    result?: unknown;
};

type ApiErrorBody = {
    success: false;
    message?: string;
    details?: Record<string, string[]>;
};

type ApiSuccessReturn<R> = {
    message?: string;
    result: R;
};

type ApiResponseBody = ApiSuccessBody | ApiErrorBody;

const parseJsonSafely = async (res: Response): Promise<ApiResponseBody | null> => {
    try { return await res.json(); }
    catch { return null; }
};

export async function handleApiResponse<T extends FieldValues, R = unknown>(
    response: Response,
    setError: UseFormSetError<T>
): Promise<ApiSuccessReturn<R> | false> {
    const body = await parseJsonSafely(response);

    if (response.status === 401) {
        toast.error(body?.message ?? "ログインしてください");
        if (window.location.pathname !== "/login") {
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search);
            setTimeout(() => { window.location.href = `/login?callbackUrl=${callbackUrl}`; }, 1000);
        }
        return false;
    }

    if (!response.ok || !body?.success) {
        const errorBody = body?.success === false ? body : null;
        if (errorBody?.details) {
            Object.entries(errorBody.details).forEach(([field, messages]) =>
                setError(field as Path<T>, { type: "server", message: messages[0] ?? "入力内容を確認してください" })
            );
        } else {
            toast.error(errorBody?.message ?? "登録に失敗しました");
        }
        return false;
    }

    return {
        message: body.message,
        result: (body.result ?? true) as R
    };
}
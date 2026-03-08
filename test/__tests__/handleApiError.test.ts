import { handleApiError } from "@/lib/services/common/handleApiError";
import { BusinessValidationError } from "@/types/handleApiErrorType";

describe("handleApiError", () => {
  it("BusinessValidationErrorはstatus・code・messageを返す", async () => {
    const error = new BusinessValidationError("入力エラー", 422, "VALIDATION_ERROR", {
      "rows.0.itemId": ["商品が見つかりません"],
    });

    const res = handleApiError(error);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.message).toBe("入力エラー");
    expect(body.details["rows.0.itemId"]).toEqual(["商品が見つかりません"]);
  });

  it("BusinessValidationErrorでdetailsなしの場合、detailsキーが含まれない", async () => {
    const error = new BusinessValidationError("未認証", 401, "UNAUTHORIZED");

    const res = handleApiError(error);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.details).toBeUndefined();
  });

  it("未知のエラーは500を返す", async () => {
    const error = new Error("予期しないエラー");

    const res = handleApiError(error);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.code).toBe("SERVER_ERROR");
  });

  it("文字列エラーも500を返す", async () => {
    const res = handleApiError("something went wrong");
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.code).toBe("SERVER_ERROR");
  });
});

import { parsePageId } from "@/lib/services/common/parsePageId";

// ─── モック ──────────────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import { notFound } from "next/navigation";

const mockNotFound = notFound as unknown as jest.Mock;

// ─── ヘルパー ─────────────────────────────────────────────────────────────────
const expectNotFound = (id: string | undefined) => {
  expect(() => parsePageId(id)).toThrow("NEXT_NOT_FOUND");
  expect(mockNotFound).toHaveBeenCalled();
};

// ─── テスト ───────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

describe("parsePageId", () => {
  describe("正常系", () => {
    it("正の整数文字列をnumberに変換して返す", () => {
      expect(parsePageId("1")).toBe(1);
      expect(parsePageId("42")).toBe(42);
      expect(parsePageId("999")).toBe(999);
    });
  });

  describe("notFoundになるケース", () => {
    it("文字列の場合notFoundを呼ぶ", () => {
      expectNotFound("abc");
    });

    it("0の場合notFoundを呼ぶ", () => {
      expectNotFound("0");
    });

    it("負の数の場合notFoundを呼ぶ", () => {
      expectNotFound("-1");
    });

    it("小数の場合notFoundを呼ぶ", () => {
      expectNotFound("1.5");
    });

    it("空文字の場合notFoundを呼ぶ", () => {
      expectNotFound("");
    });

    it("undefinedの場合notFoundを呼ぶ", () => {
      expectNotFound(undefined);
    });
  });
});
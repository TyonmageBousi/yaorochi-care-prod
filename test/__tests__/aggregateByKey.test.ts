import { aggregateByKey } from "@/lib/services/outBoundApi/outBoundValidation";

describe("aggregateByKey", () => {
  it("同じitemId・storageIdの行をqtyで合算する", () => {
    const rows = [
      { itemId: 1, storageId: 10, qty: 3, notes: undefined },
      { itemId: 1, storageId: 10, qty: 2, notes: undefined },
    ];
    const result = aggregateByKey(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ itemId: 1, storageId: 10, qty: 5 });
  });

  it("異なるitemIdは別々に集計する", () => {
    const rows = [
      { itemId: 1, storageId: 10, qty: 3, notes: undefined },
      { itemId: 2, storageId: 10, qty: 4, notes: undefined },
    ];
    const result = aggregateByKey(rows);

    expect(result).toHaveLength(2);
    expect(result.find(r => r.itemId === 1)?.qty).toBe(3);
    expect(result.find(r => r.itemId === 2)?.qty).toBe(4);
  });

  it("異なるstorageIdは別々に集計する", () => {
    const rows = [
      { itemId: 1, storageId: 10, qty: 3, notes: undefined },
      { itemId: 1, storageId: 20, qty: 2, notes: undefined },
    ];
    const result = aggregateByKey(rows);

    expect(result).toHaveLength(2);
  });

  it("3行以上でも正しく合算する", () => {
    const rows = [
      { itemId: 5, storageId: 1, qty: 1, notes: undefined },
      { itemId: 5, storageId: 1, qty: 2, notes: undefined },
      { itemId: 5, storageId: 1, qty: 7, notes: undefined },
    ];
    const result = aggregateByKey(rows);

    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(10);
  });

  it("空配列は空配列を返す", () => {
    expect(aggregateByKey([])).toHaveLength(0);
  });

  it("1行のみの場合そのまま返す", () => {
    const rows = [{ itemId: 3, storageId: 5, qty: 8, notes: undefined }];
    const result = aggregateByKey(rows);

    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(8);
  });
});

type AnyFn = (...args: any[]) => any;

export const getTableName = (t: any) => t?._?.name ?? t?.name ?? "";
export const sameTable = (a: any, b: any) =>
  a === b || (getTableName(a) && getTableName(a) === getTableName(b));

export const makeSelectChain = (resolve: (table: any) => any[]) => {
  let table: any;

  const chain: any = {
    from: (t: any) => {
      table = t;
      return chain;
    },
    where: () => chain,
    limit: () => chain,
    orderBy: () => chain,
    leftJoin: () => chain,

    then: (onFulfilled: AnyFn, onRejected: AnyFn) =>
      Promise.resolve()
        .then(() => resolve(table))
        .then(onFulfilled, onRejected),
    catch: (onRejected: AnyFn) =>
      Promise.resolve()
        .then(() => resolve(table))
        .catch(onRejected),
    finally: (onFinally: AnyFn) =>
      Promise.resolve()
        .then(() => resolve(table))
        .finally(onFinally),
  };

  chain.from = jest.fn(chain.from);
  chain.where = jest.fn(chain.where);
  chain.limit = jest.fn(chain.limit);
  chain.orderBy = jest.fn(chain.orderBy);
  chain.leftJoin = jest.fn(chain.leftJoin);

  return chain;
};

export const makeInsertChain = (returnRows: any[]) => {
  const chain: any = {
    values: () => chain,
    returning: async () => returnRows,
    execute: async () => returnRows,
  };

  chain.values = jest.fn(chain.values);
  chain.returning = jest.fn(chain.returning);
  chain.execute = jest.fn(chain.execute);

  return chain;
};

export const setupDbMocks = ({
  db,
  selectResolver,
  insertReturning = [],
}: {
  db: { select: jest.Mock; insert: jest.Mock; transaction: jest.Mock };
  selectResolver: (table: any) => any[];
  insertReturning?: any[];
}) => {
  db.select.mockImplementation(() => makeSelectChain(selectResolver));
  db.insert.mockImplementation(() => makeInsertChain(insertReturning));
  db.transaction.mockImplementation(async (cb: AnyFn) => cb(db));
};

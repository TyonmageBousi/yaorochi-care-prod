// src/db/schema.ts
import {
    pgTable,
    serial,
    uuid,
    varchar,
    timestamp,
    text,
    integer,
    boolean,
    date,
    smallint,
    uniqueIndex,
    index,
    check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const lit = (n: number) => sql.raw(String(n));
const list = (values: readonly number[]) => sql.raw(values.join(", "));

// =====================================================
// users
// =====================================================

//1:管理者(ADMIN) / 2:事務職員(MANAGER) / 3:スタッフ(STAFF)
export const ROLE = {
    ADMIN: 1,
    MANAGER: 2,
    STAFF: 3,
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

const ROLE_VALUES = [ROLE.ADMIN, ROLE.MANAGER, ROLE.STAFF] as const;

export const users = pgTable(
    "users",
    {
        id: serial("id").primaryKey(),
        userId: varchar("user_id", { length: 50 }).notNull().unique(),
        passwordHash: text("password_hash").notNull(),
        name: varchar("name", { length: 100 }).notNull(),
        role: smallint("role").notNull().default(ROLE.STAFF),
        isActive: boolean("is_active").notNull().default(true),
        facilityId: integer("facility_id").notNull(),
        phone: text("phone_number").notNull(),
        hireDate: date("hire_date", { mode: "date" }).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (t) => [
        check("users_role_ck", sql`${t.role} in (${list(ROLE_VALUES)})`),
        index("users_facility_id_idx").on(t.facilityId),
    ]
);

// =====================================================
// categories
// =====================================================

export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    facilityId: integer("facility_id").notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =====================================================
// storage_locations
// =====================================================

export const storageLocations = pgTable("storage_locations", {
    id: serial("id").primaryKey(),
    facilityId: integer("facility_id").notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// =====================================================
// room_numbers
// =====================================================

export const roomNumbers = pgTable(
    "room_numbers",
    {
        id: serial("id").primaryKey(),
        facilityId: integer("facility_id").notNull(),
        label: varchar("label", { length: 50 }).notNull(),
        residentName: varchar("resident_name", { length: 100 }),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("room_numbers_facility_id_idx").on(t.facilityId),
        uniqueIndex("room_numbers_facility_label_uq").on(t.facilityId, t.label),
    ]
);

// =====================================================
// assets
// =====================================================

export const OWNER_TYPE = {
    FACILITY: 1,
    RENTAL: 2,
} as const;
export type OwnerType = (typeof OWNER_TYPE)[keyof typeof OWNER_TYPE];
const OWNER_VALUES = [OWNER_TYPE.FACILITY, OWNER_TYPE.RENTAL] as const;

export const ASSET_STATUS = {
    /** 使用中（稼働中・利用者/現場で運用中） */
    IN_USE: 1,
    /** 保管中（倉庫/保管場所にあり、使用していない） */
    IN_STORAGE: 2,
    /** メンテ中（修理/点検/清掃待ち等で一時的に運用不可） */
    MAINTENANCE: 3,
    /** 廃棄/引退（運用対象外・原則戻らない） */
    RETIRED: 4,
} as const;

export type AssetStatus = (typeof ASSET_STATUS)[keyof typeof ASSET_STATUS];
const ASSET_STATUS_VALUES = [
    ASSET_STATUS.IN_USE,
    ASSET_STATUS.IN_STORAGE,
    ASSET_STATUS.MAINTENANCE,
    ASSET_STATUS.RETIRED,
] as const;

export const assets = pgTable(
    "assets",
    {
        id: serial("id").primaryKey(),
        facilityId: integer("facility_id").notNull(),
        assetCode: varchar("asset_code", { length: 64 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        serialNumber: varchar("serial_number", { length: 128 }),
        categoryId: integer("category_id").notNull(),
        currentStorageId: integer("current_storage_id").notNull(),
        roomNumberId: integer("room_number_id"),
        owner: smallint("owner").notNull().default(OWNER_TYPE.FACILITY),
        status: smallint("status").notNull().default(ASSET_STATUS.IN_USE),
        imageUrl: text("image_url"),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("assets_facility_id_idx").on(t.facilityId),
        index("assets_facility_status_idx").on(t.facilityId, t.status),
        index("assets_facility_category_idx").on(t.facilityId, t.categoryId),
        uniqueIndex("assets_facility_asset_code_uq").on(t.facilityId, t.assetCode),
        check("assets_owner_ck", sql`${t.owner} in (${list(OWNER_VALUES)})`),
        check("assets_status_ck", sql`${t.status} in (${list(ASSET_STATUS_VALUES)})`),
    ]
);

// =====================================================
// asset_events
// =====================================================

export const ASSET_EVENT_TYPE = {
    CREATE: 1,
    MOVE: 2,
    ASSIGN_ROOM: 3,
    UNASSIGN_ROOM: 4,
    MAINTENANCE: 5,
    REPAIR: 6,
    RETIRE: 7,
} as const;
export type AssetEventType = (typeof ASSET_EVENT_TYPE)[keyof typeof ASSET_EVENT_TYPE];
export const ASSET_EVENT_TYPE_VALUES = [
    ASSET_EVENT_TYPE.CREATE,
    ASSET_EVENT_TYPE.MOVE,
    ASSET_EVENT_TYPE.ASSIGN_ROOM,
    ASSET_EVENT_TYPE.UNASSIGN_ROOM,
    ASSET_EVENT_TYPE.MAINTENANCE,
    ASSET_EVENT_TYPE.REPAIR,
    ASSET_EVENT_TYPE.RETIRE,
] as const;

export const assetEvents = pgTable(
    "asset_events",
    {
        id: serial("id").primaryKey(),
        facilityId: integer("facility_id").notNull(),
        assetId: integer("asset_id").notNull(),
        type: smallint("type").notNull(),
        fromStorageId: integer("from_storage_id"),
        toStorageId: integer("to_storage_id"),
        fromRoomNumberId: integer("from_room_number_id"),
        toRoomNumberId: integer("to_room_number_id"),
        performedBy: integer("performed_by"),
        performedAt: timestamp("performed_at", { withTimezone: true }).notNull().defaultNow(),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("asset_events_facility_id_idx").on(t.facilityId),
        index("asset_events_asset_id_idx").on(t.assetId),
        check("asset_events_type_ck", sql`${t.type} in (${list(ASSET_EVENT_TYPE_VALUES)})`),
    ]
);

// =====================================================
// items
// =====================================================

export const ITEM_STATUS_FLAGS = {
    ACTIVE: 1,
    DELETED: 2,
} as const;
export type ItemStatus = (typeof ITEM_STATUS_FLAGS)[keyof typeof ITEM_STATUS_FLAGS];
const ITEM_STATUS_VALUES = [ITEM_STATUS_FLAGS.ACTIVE, ITEM_STATUS_FLAGS.DELETED] as const;

export const items = pgTable(
    "items",
    {
        id: serial("id").primaryKey(),
        facilityId: integer("facility_id").notNull(),
        itemCode: varchar("item_code", { length: 64 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        unit: integer("unit").notNull(),
        status: smallint("status").notNull().default(ITEM_STATUS_FLAGS.ACTIVE),
        parLevel: integer("par_level"),
        reorderPoint: integer("reorder_point"),
        imageUrl: text("image_url"),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("items_facility_id_idx").on(t.facilityId),
        index("items_facility_status_idx").on(t.facilityId, t.status),
        uniqueIndex("items_facility_item_code_uq").on(t.facilityId, t.itemCode),
        check("items_status_ck", sql`${t.status} in (${list(ITEM_STATUS_VALUES)})`),
    ]
);

// =====================================================
// stock_transactions
// =====================================================

export const STOCK_TX_TYPE = {
    IN: 1,
    OUT: 2,
    WASTE: 3,
    ADJUST: 4,
    STOCKTAKE: 5,
} as const;
export type StockTxType = (typeof STOCK_TX_TYPE)[keyof typeof STOCK_TX_TYPE];
const STOCK_TX_TYPE_VALUES = [
    STOCK_TX_TYPE.IN,
    STOCK_TX_TYPE.OUT,
    STOCK_TX_TYPE.WASTE,
    STOCK_TX_TYPE.ADJUST,
    STOCK_TX_TYPE.STOCKTAKE,
] as const;

export const stockTransactions = pgTable(
    "stock_transactions",
    {
        id: serial("id").primaryKey(),
        facilityId: integer("facility_id").notNull(),
        itemId: integer("item_id").notNull(),
        type: smallint("type").notNull().default(STOCK_TX_TYPE.IN),
        qty: integer("qty").notNull(),
        storageId: integer("storage_id").notNull(),
        residentName: varchar("resident_name", { length: 100 }),
        performedBy: integer("performed_by"),
        performedAt: timestamp("performed_at", { withTimezone: true }).notNull().defaultNow(),
        notes: text("notes"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index("stock_tx_facility_id_idx").on(t.facilityId),
        index("stock_tx_item_id_idx").on(t.itemId),
        index("stock_tx_storage_id_idx").on(t.storageId),

        // typeの範囲
        check("stock_tx_type_ck", sql`${t.type} in (${list(STOCK_TX_TYPE_VALUES)})`),

        // OUTのとき resident_name 必須（$1対策：litで直埋め）
        check(
            "stock_tx_out_requires_resident_name_ck",
            sql`(${t.type} <> ${lit(STOCK_TX_TYPE.OUT)})
          OR (${t.residentName} IS NOT NULL AND length(${t.residentName}) > 0)`
        ),
    ]
);

// =====================================================
// stocktakes
// =====================================================

export const STOCKTAKE_STATUS = {
    IN_PROGRESS: 1,
    POSTED: 2,
    CANCELED: 3,
} as const;
export type StocktakeStatus = (typeof STOCKTAKE_STATUS)[keyof typeof STOCKTAKE_STATUS];

const STOCKTAKE_STATUS_VALUES = [
    STOCKTAKE_STATUS.IN_PROGRESS,
    STOCKTAKE_STATUS.POSTED,
    STOCKTAKE_STATUS.CANCELED,
] as const;

export const stockTakes = pgTable(
    "stock_takes",
    {
        id: serial("id").primaryKey(),
        facilityId: integer("facility_id").notNull(),
        storageId: integer("storage_id").notNull().references(() => storageLocations.id, { onDelete: "restrict" }),
        status: smallint("status").notNull().default(STOCKTAKE_STATUS.IN_PROGRESS),
        startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
        postedAt: timestamp("posted_at", { withTimezone: true }),
        notes: text("notes"),
        createdBy: integer("created_by"),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        check("stocktakes_status_ck", sql`${t.status} in (${list(STOCKTAKE_STATUS_VALUES)})`),

        uniqueIndex("stocktakes_one_in_progress_per_storage_ux")
            .on(t.facilityId, t.storageId)
            .where(sql`${t.status} = ${lit(STOCKTAKE_STATUS.IN_PROGRESS)}`),

        index("stocktakes_facility_storage_status_started_ix").on(
            t.facilityId,
            t.storageId,
            t.status,
            t.startedAt
        ),
    ]
);

// =====================================================
// stocktake_lines
// =====================================================

export const stockTakeLines = pgTable(
    "stocktake_lines",
    {
        id: serial("id").primaryKey(),
        stockTakeId: integer("stock_take_id").notNull().references(() => stockTakes.id, { onDelete: "cascade" }),
        itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),
        systemQty: integer("system_qty").notNull(),
        countedQty: integer("counted_qty"),
        adjustmentTxId: integer("adjustment_tx_id").references(() => stockTransactions.id, { onDelete: "set null", }),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        uniqueIndex("stock_take_lines_stock_take_item_ux").on(t.stockTakeId, t.itemId),

        check("stock_take_lines_system_qty_non_neg_ck", sql`${t.systemQty} >= 0`),
        check(
            "stock_take_lines_counted_qty_non_neg_ck",
            sql`${t.countedQty} is null OR ${t.countedQty} >= 0`
        ),

        index("stock_take_lines_stock_take_ix").on(t.stockTakeId),
        index("stock_take_lines_item_ix").on(t.itemId),
        index("stock_take_lines_adjustment_tx_ix").on(t.adjustmentTxId),
    ]
);

// =====================================================
// relations
// =====================================================

export const assetEventRelations = relations(assetEvents, ({ one }) => ({
    asset: one(assets, {
        fields: [assetEvents.assetId],
        references: [assets.id],
    }),
    performedByUser: one(users, {
        fields: [assetEvents.performedBy],
        references: [users.id],
    }),
    toRoomNumber: one(roomNumbers, {
        fields: [assetEvents.toRoomNumberId],
        references: [roomNumbers.id],
    }),
    fromRoomNumber: one(roomNumbers, {
        fields: [assetEvents.fromRoomNumberId],
        references: [roomNumbers.id],
    }),
}));

export const assetRelations = relations(assets, ({ one, many }) => ({
    events: many(assetEvents),
    currentStorage: one(storageLocations, {
        fields: [assets.currentStorageId],
        references: [storageLocations.id],
    }),
    roomNumber: one(roomNumbers, {
        fields: [assets.roomNumberId],
        references: [roomNumbers.id],
    }),
}));

export const roomNumberRelations = relations(roomNumbers, ({ many }) => ({
    assetEvents: many(assetEvents),
    assets: many(assets),
}));

export const userRelations = relations(users, ({ many }) => ({
    assetEvents: many(assetEvents),
    stockTransactions: many(stockTransactions),
}));

export const itemsRelations = relations(items, ({ many }) => ({
    stockTransactions: many(stockTransactions),
}));

export const stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
    item: one(items, {
        fields: [stockTransactions.itemId],
        references: [items.id],
    }),
    performedByUser: one(users, {
        fields: [stockTransactions.performedBy],
        references: [users.id],
    }),
}));

export const stocktakesRelations = relations(stockTakes, ({ many }) => ({
    lines: many(stockTakeLines),
}));

export const stockTakeLinesRelations = relations(stockTakeLines, ({ one }) => ({
    stockTake: one(stockTakes, {
        fields: [stockTakeLines.stockTakeId],
        references: [stockTakes.id],
    }),
    item: one(items, {
        fields: [stockTakeLines.itemId],
        references: [items.id],
    }),
}));
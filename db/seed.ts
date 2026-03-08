import dotenv from "dotenv";
dotenv.config();

import { db } from "@/db";
import {
    users,
    categories,
    storageLocations,
    roomNumbers,
    assets,
    assetEvents,
    items,
    stockTransactions,
    stockTakes,
    stockTakeLines,
    ROLE,
    OWNER_TYPE,
    ASSET_STATUS,
    ASSET_EVENT_TYPE,
    ITEM_STATUS_FLAGS,
    STOCK_TX_TYPE,
    STOCKTAKE_STATUS,
} from "@/db/schema";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("シードデータ投入開始...");

    const password = await bcrypt.hash("password123", 10);

    // =====================================================
    // users (施設1:4人 / 施設2:3人 / 施設3:3人)
    // =====================================================
    console.log("  👤 users...");
    const insertedUsers = await db
        .insert(users)
        .values([
            // 施設1
            { userId: "admin001", passwordHash: password, name: "田中 太郎", role: ROLE.ADMIN, isActive: true, facilityId: 1, phone: "090-1111-0001", hireDate: new Date("2020-04-01") },
            { userId: "manager001", passwordHash: password, name: "佐藤 花子", role: ROLE.MANAGER, isActive: true, facilityId: 1, phone: "090-1111-0002", hireDate: new Date("2021-04-01") },
            { userId: "staff001", passwordHash: password, name: "鈴木 一郎", role: ROLE.STAFF, isActive: true, facilityId: 1, phone: "090-1111-0003", hireDate: new Date("2022-04-01") },
            { userId: "staff002", passwordHash: password, name: "高橋 美咲", role: ROLE.STAFF, isActive: false, facilityId: 1, phone: "090-1111-0004", hireDate: new Date("2019-04-01") },
            // 施設2
            { userId: "admin002", passwordHash: password, name: "伊藤 健二", role: ROLE.ADMIN, isActive: true, facilityId: 2, phone: "090-2222-0001", hireDate: new Date("2019-10-01") },
            { userId: "manager002", passwordHash: password, name: "渡辺 さくら", role: ROLE.MANAGER, isActive: true, facilityId: 2, phone: "090-2222-0002", hireDate: new Date("2021-04-01") },
            { userId: "staff003", passwordHash: password, name: "中村 翔太", role: ROLE.STAFF, isActive: true, facilityId: 2, phone: "090-2222-0003", hireDate: new Date("2022-07-01") },
            // 施設3
            { userId: "admin003", passwordHash: password, name: "小林 恵", role: ROLE.ADMIN, isActive: true, facilityId: 3, phone: "090-3333-0001", hireDate: new Date("2020-01-01") },
            { userId: "manager003", passwordHash: password, name: "加藤 直樹", role: ROLE.MANAGER, isActive: true, facilityId: 3, phone: "090-3333-0002", hireDate: new Date("2021-09-01") },
            { userId: "staff004", passwordHash: password, name: "松本 理恵", role: ROLE.STAFF, isActive: true, facilityId: 3, phone: "090-3333-0003", hireDate: new Date("2023-04-01") },
        ])
        .returning({ id: users.id, userId: users.userId, facilityId: users.facilityId });

    const userId = (uid: string) => {
        const u = insertedUsers.find((u) => u.userId === uid);
        if (!u) throw new Error(`user not found: ${uid}`);
        return u.id;
    };

    // =====================================================
    // categories (施設ごと)
    // =====================================================
    console.log("categories...");
    const insertedCategories = await db
        .insert(categories)
        .values([
            // 施設1
            { facilityId: 1, label: "福祉機器" },
            { facilityId: 1, label: "医療消耗品" },
            { facilityId: 1, label: "清掃用品" },
            { facilityId: 1, label: "介護用品" },
            // 施設2
            { facilityId: 2, label: "福祉機器" },
            { facilityId: 2, label: "医療消耗品" },
            { facilityId: 2, label: "介護用品" },
            // 施設3
            { facilityId: 3, label: "福祉機器" },
            { facilityId: 3, label: "医療消耗品" },
            { facilityId: 3, label: "介護用品" },
        ])
        .returning({ id: categories.id, label: categories.label, facilityId: categories.facilityId });

    const categoryId = (facilityId: number, label: string) => {
        const cat = insertedCategories.find((c) => c.facilityId === facilityId && c.label === label);
        if (!cat) throw new Error(`category not found: ${facilityId} / ${label}`);
        return cat.id;
    };

    // =====================================================
    // storage_locations
    // =====================================================
    console.log("storage_locations...");
    const insertedStorages = await db
        .insert(storageLocations)
        .values([
            // 施設1
            { facilityId: 1, label: "1F倉庫A" },
            { facilityId: 1, label: "1F倉庫B" },
            { facilityId: 1, label: "2Fナースステーション" },
            { facilityId: 1, label: "屋外倉庫" },
            // 施設2
            { facilityId: 2, label: "1F倉庫" },
            { facilityId: 2, label: "ナースステーション" },
            // 施設3
            { facilityId: 3, label: "1F倉庫" },
            { facilityId: 3, label: "ナースステーション" },
        ])
        .returning({ id: storageLocations.id, label: storageLocations.label, facilityId: storageLocations.facilityId });

    const storageId = (facilityId: number, label: string) => {
        const s = insertedStorages.find((s) => s.facilityId === facilityId && s.label === label);
        if (!s) throw new Error(`storage not found: ${facilityId} / ${label}`);
        return s.id;
    };

    // =====================================================
    // room_numbers
    // =====================================================
    console.log("room_numbers...");
    const insertedRooms = await db
        .insert(roomNumbers)
        .values([
            // 施設1
            { facilityId: 1, label: "101", residentName: "山本 幸子" },
            { facilityId: 1, label: "102", residentName: "木村 正雄", notes: "要車椅子対応" },
            { facilityId: 1, label: "103", residentName: "林 節子" },
            { facilityId: 1, label: "201", residentName: "松本 義雄" },
            { facilityId: 1, label: "202", residentName: null, notes: "空室" },
            // 施設2
            { facilityId: 2, label: "101", residentName: "清水 博" },
            { facilityId: 2, label: "102", residentName: "池田 美代" },
            { facilityId: 2, label: "201", residentName: "橋本 勇" },
            // 施設3
            { facilityId: 3, label: "101", residentName: "石川 富子" },
            { facilityId: 3, label: "102", residentName: "前田 清" },
        ])
        .returning({ id: roomNumbers.id, label: roomNumbers.label, facilityId: roomNumbers.facilityId });

    const roomId = (facilityId: number, label: string) => {
        const r = insertedRooms.find((r) => r.facilityId === facilityId && r.label === label);
        if (!r) throw new Error(`room not found: ${facilityId} / ${label}`);
        return r.id;
    };

    // =====================================================
    // assets
    // =====================================================
    console.log("assets...");
    const insertedAssets = await db
        .insert(assets)
        .values([
            // 施設1
            { facilityId: 1, assetCode: "AST-0001", name: "電動ベッド", serialNumber: "SN-BED-001", categoryId: categoryId(1, "福祉機器"), currentStorageId: storageId(1, "2Fナースステーション"), roomNumberId: roomId(1, "101"), owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_USE, notes: "101号室 山本様使用中" },
            { facilityId: 1, assetCode: "AST-0002", name: "車椅子（標準型）", serialNumber: "SN-WC-001", categoryId: categoryId(1, "福祉機器"), currentStorageId: storageId(1, "2Fナースステーション"), roomNumberId: roomId(1, "102"), owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_USE, notes: "102号室 木村様使用中" },
            { facilityId: 1, assetCode: "AST-0003", name: "車椅子（リクライニング）", serialNumber: "SN-WC-002", categoryId: categoryId(1, "福祉機器"), currentStorageId: storageId(1, "1F倉庫A"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_STORAGE, notes: null },
            { facilityId: 1, assetCode: "AST-0004", name: "シャワーチェア", serialNumber: "SN-SC-001", categoryId: categoryId(1, "福祉機器"), currentStorageId: storageId(1, "1F倉庫B"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.MAINTENANCE, notes: "定期点検中" },
            { facilityId: 1, assetCode: "AST-0005", name: "血圧計", serialNumber: "SN-BP-001", categoryId: categoryId(1, "医療消耗品"), currentStorageId: storageId(1, "2Fナースステーション"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_USE, notes: null },
            { facilityId: 1, assetCode: "AST-0006", name: "旧式ベッド", serialNumber: "SN-BED-OLD", categoryId: categoryId(1, "福祉機器"), currentStorageId: storageId(1, "屋外倉庫"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.RETIRED, notes: "廃棄予定" },
            // 施設2
            { facilityId: 2, assetCode: "AST-0001", name: "車椅子", serialNumber: "SN-WC-201", categoryId: categoryId(2, "福祉機器"), currentStorageId: storageId(2, "ナースステーション"), roomNumberId: roomId(2, "101"), owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_USE, notes: "101号室 清水様使用中" },
            { facilityId: 2, assetCode: "AST-0002", name: "歩行器", serialNumber: "SN-WK-201", categoryId: categoryId(2, "福祉機器"), currentStorageId: storageId(2, "1F倉庫"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_STORAGE, notes: null },
            { facilityId: 2, assetCode: "AST-0003", name: "吸引器", serialNumber: "SN-SU-201", categoryId: categoryId(2, "医療消耗品"), currentStorageId: storageId(2, "ナースステーション"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_USE, notes: null },
            // 施設3
            { facilityId: 3, assetCode: "AST-0001", name: "車椅子", serialNumber: "SN-WC-301", categoryId: categoryId(3, "福祉機器"), currentStorageId: storageId(3, "ナースステーション"), roomNumberId: roomId(3, "101"), owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_USE, notes: "101号室 石川様使用中" },
            { facilityId: 3, assetCode: "AST-0002", name: "歩行器（予備）", serialNumber: "SN-WK-301", categoryId: categoryId(3, "福祉機器"), currentStorageId: storageId(3, "1F倉庫"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_STORAGE, notes: null },
            { facilityId: 3, assetCode: "AST-0003", name: "血圧計", serialNumber: "SN-BP-301", categoryId: categoryId(3, "医療消耗品"), currentStorageId: storageId(3, "ナースステーション"), roomNumberId: null, owner: OWNER_TYPE.FACILITY, status: ASSET_STATUS.IN_USE, notes: null },
        ])
        .returning({ id: assets.id, assetCode: assets.assetCode, facilityId: assets.facilityId });

    const assetId = (facilityId: number, code: string) => {
        const a = insertedAssets.find((a) => a.facilityId === facilityId && a.assetCode === code);
        if (!a) throw new Error(`asset not found: ${facilityId} / ${code}`);
        return a.id;
    };

    // =====================================================
    // asset_events
    // =====================================================
    console.log("asset_events...");
    await db.insert(assetEvents).values([
        // 施設1
        { facilityId: 1, assetId: assetId(1, "AST-0001"), type: ASSET_EVENT_TYPE.CREATE, toStorageId: storageId(1, "2Fナースステーション"), performedBy: userId("admin001"), notes: "資産登録" },
        { facilityId: 1, assetId: assetId(1, "AST-0001"), type: ASSET_EVENT_TYPE.ASSIGN_ROOM, toRoomNumberId: roomId(1, "101"), performedBy: userId("manager001"), notes: "101号室へ配置" },
        { facilityId: 1, assetId: assetId(1, "AST-0002"), type: ASSET_EVENT_TYPE.CREATE, toStorageId: storageId(1, "2Fナースステーション"), performedBy: userId("admin001"), notes: "資産登録" },
        { facilityId: 1, assetId: assetId(1, "AST-0002"), type: ASSET_EVENT_TYPE.ASSIGN_ROOM, toRoomNumberId: roomId(1, "102"), performedBy: userId("manager001"), notes: "102号室へ配置" },
        { facilityId: 1, assetId: assetId(1, "AST-0004"), type: ASSET_EVENT_TYPE.MAINTENANCE, performedBy: userId("staff001"), notes: "シャワーチェア 定期点検開始" },
        { facilityId: 1, assetId: assetId(1, "AST-0006"), type: ASSET_EVENT_TYPE.RETIRE, performedBy: userId("admin001"), notes: "旧式ベッド 廃棄処理" },
        // 施設2
        { facilityId: 2, assetId: assetId(2, "AST-0001"), type: ASSET_EVENT_TYPE.CREATE, toStorageId: storageId(2, "ナースステーション"), performedBy: userId("admin002"), notes: "資産登録" },
        { facilityId: 2, assetId: assetId(2, "AST-0001"), type: ASSET_EVENT_TYPE.ASSIGN_ROOM, toRoomNumberId: roomId(2, "101"), performedBy: userId("manager002"), notes: "101号室へ配置" },
        { facilityId: 2, assetId: assetId(2, "AST-0003"), type: ASSET_EVENT_TYPE.MAINTENANCE, performedBy: userId("staff003"), notes: "吸引器 点検" },
        // 施設3
        { facilityId: 3, assetId: assetId(3, "AST-0001"), type: ASSET_EVENT_TYPE.CREATE, toStorageId: storageId(3, "ナースステーション"), performedBy: userId("admin003"), notes: "資産登録" },
        { facilityId: 3, assetId: assetId(3, "AST-0001"), type: ASSET_EVENT_TYPE.ASSIGN_ROOM, toRoomNumberId: roomId(3, "101"), performedBy: userId("manager003"), notes: "101号室へ配置" },
        { facilityId: 3, assetId: assetId(3, "AST-0002"), type: ASSET_EVENT_TYPE.REPAIR, performedBy: userId("staff004"), notes: "歩行器 修理" },
    ]);

    // =====================================================
    // items
    // =====================================================
    console.log("items...");
    const insertedItems = await db
        .insert(items)
        .values([
            // 施設1
            { facilityId: 1, itemCode: "ITM-0001", name: "使い捨て手袋（M）", unit: 3, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 10, reorderPoint: 3, notes: "100枚/箱" },
            { facilityId: 1, itemCode: "ITM-0002", name: "マスク（不織布）", unit: 3, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 5, reorderPoint: 2, notes: "50枚/箱" },
            { facilityId: 1, itemCode: "ITM-0003", name: "オムツ（Mサイズ）", unit: 2, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 20, reorderPoint: 5, notes: "20枚/袋" },
            { facilityId: 1, itemCode: "ITM-0004", name: "消毒用アルコール", unit: 4, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 10, reorderPoint: 3, notes: "500ml" },
            { facilityId: 1, itemCode: "ITM-0005", name: "サージカルテープ", unit: 5, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 5, reorderPoint: 2, notes: null },
            { facilityId: 1, itemCode: "ITM-0006", name: "旧型ガーゼ", unit: 2, status: ITEM_STATUS_FLAGS.DELETED, parLevel: null, reorderPoint: null, notes: "廃番" },
            // 施設2
            { facilityId: 2, itemCode: "ITM-0001", name: "使い捨て手袋（M）", unit: 3, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 10, reorderPoint: 3, notes: null },
            { facilityId: 2, itemCode: "ITM-0002", name: "マスク（不織布）", unit: 3, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 5, reorderPoint: 2, notes: null },
            { facilityId: 2, itemCode: "ITM-0003", name: "消毒用アルコール", unit: 4, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 10, reorderPoint: 3, notes: null },
            { facilityId: 2, itemCode: "ITM-0004", name: "口腔ケアスポンジ", unit: 4, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 30, reorderPoint: 10, notes: null },
            // 施設3
            { facilityId: 3, itemCode: "ITM-0001", name: "使い捨て手袋（L）", unit: 3, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 10, reorderPoint: 3, notes: null },
            { facilityId: 3, itemCode: "ITM-0002", name: "マスク（不織布）", unit: 3, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 5, reorderPoint: 2, notes: null },
            { facilityId: 3, itemCode: "ITM-0003", name: "消毒用アルコール", unit: 4, status: ITEM_STATUS_FLAGS.ACTIVE, parLevel: 8, reorderPoint: 3, notes: null },
        ])
        .returning({ id: items.id, sku: items.itemCode, facilityId: items.facilityId });

    const itemId = (facilityId: number, sku: string) => {
        const item = insertedItems.find((i) => i.facilityId === facilityId && i.sku === sku);
        if (!item) throw new Error(`item not found: ${facilityId} / ${sku}`);
        return item.id;
    };

    // =====================================================
    // stock_transactions
    // =====================================================
    console.log("stock_transactions...");
    await db.insert(stockTransactions).values([
        // 施設1 入庫
        { facilityId: 1, itemId: itemId(1, "ITM-0001"), type: STOCK_TX_TYPE.IN, qty: 20, storageId: storageId(1, "1F倉庫A"), residentName: null, performedBy: userId("admin001"), notes: "定期発注" },
        { facilityId: 1, itemId: itemId(1, "ITM-0002"), type: STOCK_TX_TYPE.IN, qty: 10, storageId: storageId(1, "1F倉庫A"), residentName: null, performedBy: userId("admin001"), notes: "定期発注" },
        { facilityId: 1, itemId: itemId(1, "ITM-0003"), type: STOCK_TX_TYPE.IN, qty: 30, storageId: storageId(1, "1F倉庫A"), residentName: null, performedBy: userId("admin001"), notes: "定期発注" },
        { facilityId: 1, itemId: itemId(1, "ITM-0004"), type: STOCK_TX_TYPE.IN, qty: 12, storageId: storageId(1, "2Fナースステーション"), residentName: null, performedBy: userId("manager001"), notes: "補充" },
        // 施設1 払出
        { facilityId: 1, itemId: itemId(1, "ITM-0001"), type: STOCK_TX_TYPE.OUT, qty: -2, storageId: storageId(1, "1F倉庫A"), residentName: "山本 幸子", performedBy: userId("staff001"), notes: null },
        { facilityId: 1, itemId: itemId(1, "ITM-0003"), type: STOCK_TX_TYPE.OUT, qty: -3, storageId: storageId(1, "1F倉庫A"), residentName: "木村 正雄", performedBy: userId("staff001"), notes: null },
        { facilityId: 1, itemId: itemId(1, "ITM-0002"), type: STOCK_TX_TYPE.OUT, qty: -1, storageId: storageId(1, "2Fナースステーション"), residentName: "林 節子", performedBy: userId("manager001"), notes: null },
        // 施設1 廃棄・調整
        { facilityId: 1, itemId: itemId(1, "ITM-0001"), type: STOCK_TX_TYPE.WASTE, qty: -1, storageId: storageId(1, "1F倉庫A"), residentName: null, performedBy: userId("staff001"), notes: "破れた手袋" },
        { facilityId: 1, itemId: itemId(1, "ITM-0004"), type: STOCK_TX_TYPE.ADJUST, qty: 2, storageId: storageId(1, "2Fナースステーション"), residentName: null, performedBy: userId("manager001"), notes: "棚卸差異調整" },
        // 施設2 入庫
        { facilityId: 2, itemId: itemId(2, "ITM-0001"), type: STOCK_TX_TYPE.IN, qty: 15, storageId: storageId(2, "1F倉庫"), residentName: null, performedBy: userId("admin002"), notes: "定期発注" },
        { facilityId: 2, itemId: itemId(2, "ITM-0003"), type: STOCK_TX_TYPE.IN, qty: 20, storageId: storageId(2, "ナースステーション"), residentName: null, performedBy: userId("admin002"), notes: "補充" },
        // 施設2 払出
        { facilityId: 2, itemId: itemId(2, "ITM-0001"), type: STOCK_TX_TYPE.OUT, qty: -2, storageId: storageId(2, "1F倉庫"), residentName: "清水 博", performedBy: userId("staff003"), notes: null },
        { facilityId: 2, itemId: itemId(2, "ITM-0004"), type: STOCK_TX_TYPE.OUT, qty: -2, storageId: storageId(2, "ナースステーション"), residentName: "池田 美代", performedBy: userId("manager002"), notes: null },
        // 施設3 入庫
        { facilityId: 3, itemId: itemId(3, "ITM-0001"), type: STOCK_TX_TYPE.IN, qty: 20, storageId: storageId(3, "1F倉庫"), residentName: null, performedBy: userId("admin003"), notes: "定期発注" },
        { facilityId: 3, itemId: itemId(3, "ITM-0003"), type: STOCK_TX_TYPE.IN, qty: 15, storageId: storageId(3, "ナースステーション"), residentName: null, performedBy: userId("admin003"), notes: "補充" },
        // 施設3 払出
        { facilityId: 3, itemId: itemId(3, "ITM-0001"), type: STOCK_TX_TYPE.OUT, qty: -1, storageId: storageId(3, "1F倉庫"), residentName: "石川 富子", performedBy: userId("staff004"), notes: null },
        { facilityId: 3, itemId: itemId(3, "ITM-0003"), type: STOCK_TX_TYPE.OUT, qty: -2, storageId: storageId(3, "ナースステーション"), residentName: "前田 清", performedBy: userId("manager003"), notes: null },
    ]);

    // =====================================================
    // stock_takes
    // =====================================================
    console.log("stock_takes...");
    const insertedStockTakes = await db
        .insert(stockTakes)
        .values([
            { facilityId: 1, storageId: storageId(1, "1F倉庫A"), status: STOCKTAKE_STATUS.POSTED, notes: "月次棚卸（完了）", createdBy: userId("admin001"), postedAt: new Date("2026-02-28") },
            { facilityId: 1, storageId: storageId(1, "2Fナースステーション"), status: STOCKTAKE_STATUS.IN_PROGRESS, notes: "ナースステーション棚卸中", createdBy: userId("manager001") },
            { facilityId: 2, storageId: storageId(2, "1F倉庫"), status: STOCKTAKE_STATUS.CANCELED, notes: "棚卸中止", createdBy: userId("admin002") },
        ])
        .returning({ id: stockTakes.id, storageId: stockTakes.storageId, facilityId: stockTakes.facilityId });

    const stockTakeId = (facilityId: number, storageLabel: string) => {
        const sid = storageId(facilityId, storageLabel);
        const st = insertedStockTakes.find((s) => s.facilityId === facilityId && s.storageId === sid);
        if (!st) throw new Error(`stock_take not found: ${facilityId} / ${storageLabel}`);
        return st.id;
    };

    // =====================================================
    // stocktake_lines
    // =====================================================
    console.log("stock-take_lines...");
    await db.insert(stockTakeLines).values([
        // 施設1 倉庫A（POSTED）
        { stockTakeId: stockTakeId(1, "1F倉庫A"), itemId: itemId(1, "ITM-0001"), systemQty: 17, countedQty: 17 },
        { stockTakeId: stockTakeId(1, "1F倉庫A"), itemId: itemId(1, "ITM-0003"), systemQty: 27, countedQty: 26 },
        // 施設1 ナースステーション（IN_PROGRESS）
        { stockTakeId: stockTakeId(1, "2Fナースステーション"), itemId: itemId(1, "ITM-0002"), systemQty: 9, countedQty: null },
        { stockTakeId: stockTakeId(1, "2Fナースステーション"), itemId: itemId(1, "ITM-0004"), systemQty: 14, countedQty: 14 },
    ]);

    console.log("シードデータ投入完了！");
    process.exit(0);
}

seed().catch((e) => {
    console.error("シード失敗:", e);
    process.exit(1);
});

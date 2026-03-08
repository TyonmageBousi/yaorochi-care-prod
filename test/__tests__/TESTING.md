# テストガイド

## テスト構成

```
__tests__/
├── api/                          # API Route のテスト
│   ├── inbound/
│   │   └── register.test.ts      # 入庫登録 POST /api/inbound/register
│   ├── outbound/
│   │   └── register.test.ts      # 払出登録 POST /api/outbound/register
│   ├── asset/
│   │   ├── register.test.ts      # 資産登録・更新 POST /api/asset/register/new|[id]
│   │   └── delete.test.ts        # 資産削除 POST /api/asset/delete/[id]
│   ├── item/
│   │   ├── register.test.ts      # 消耗品登録・更新 POST /api/item/register/new|[id]
│   │   └── delete.test.ts        # 消耗品削除 POST /api/item/delete/[id]
│   ├── staff/
│   │   └── register.test.ts      # スタッフ登録 POST /api/staff/register
│   ├── room-number/
│   │   └── register.test.ts      # 部屋番号登録 POST /api/room-number/register
│   ├── stock-take/
│   │   ├── create.test.ts        # 棚卸作成 POST /api/stock-take/create
│   │   ├── lines-update.test.ts  # 棚卸明細保存 POST /api/stock-take/[id]/lines
│   │   ├── lines-delete.test.ts  # 棚卸明細削除 DELETE /api/stock-take/[id]/lines/[lineId]
│   │   ├── post.test.ts          # 棚卸確定 POST /api/stock-take/[id]/post
│   │   └── cancel-progress.test.ts # 棚卸キャンセル POST /api/stock-take/cancel-progress
│   ├── asset-bound.test.ts       # 資産イベント POST /api/asset-bound
│   └── resident-register.test.ts # 入居者登録 POST /api/resident-register
│
└── lib/                          # ユーティリティ・サービスのテスト
    ├── validations/
    │   └── normalizers.test.ts   # 入力値正規化ユーティリティ
    └── services/
        ├── handleApiError.test.ts  # APIエラーハンドリング
        ├── handleZodErrors.test.ts # Zodバリデーションエラー変換
        └── aggregateByKey.test.ts  # 払出数量集計ロジック
```

## テストの考え方

各テストファイルは以下の観点でカバーしています：

| 観点 | 内容 |
|------|------|
| **正常系** | 正しいリクエストで期待通りのレスポンスが返ること |
| **認証エラー** | 未認証時に401が返ること |
| **バリデーションエラー** | 不正な入力で400が返ること |
| **ビジネスロジックエラー** | 重複・存在しない等で適切なステータスが返ること |

## 実行方法

```bash
# 全テスト実行
npm test

# ウォッチモード（開発中）
npm test -- --watch

# カバレッジ確認
npm test -- --coverage

# 特定ファイルのみ
npm test -- __tests__/api/inbound/register.test.ts
```

## モック方針

- **`requireUser`**: 全ルートでモック（認証をスキップ）
- **Repository層**: jest.mock で差し替え、DBアクセスなし
- **`@/db`**: 直接DBを使うルートはdbオブジェクトをモック
- **`@/storage/storage`**: 画像ストレージをモック

これにより、テストはDBや外部サービスなしに高速で実行できます。

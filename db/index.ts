import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL!;

// グローバルキャッシュで接続使い回し
const globalForDb = global as unknown as { client: postgres.Sql };
const client = globalForDb.client ?? postgres(connectionString, {
    max: 10, // 最大接続数
});
if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });
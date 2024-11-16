import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const globalForDb = globalThis as unknown as {
  dbPool: pg.Pool | undefined;
};

const pool =
  globalForDb.dbPool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
  });
if (process.env.APP_ENV !== "production") {
  globalForDb.dbPool = pool;
}

export const db = drizzle({ client: pool, casing: "snake_case" });

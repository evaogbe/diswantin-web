import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "~/env/private.server";

const globalForDb = globalThis as unknown as {
  dbPool?: pg.Pool;
};

const pool =
  globalForDb.dbPool ??
  // pg is a commonjs module that doesn't use named exports
  // eslint-disable-next-line import-x/no-named-as-default-member
  new pg.Pool({
    connectionString: env.DATABASE_URL,
  });
if (env.NODE_ENV === "development") {
  globalForDb.dbPool = pool;
}

export const db = drizzle({ client: pool, casing: "snake_case", logger: true });

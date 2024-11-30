import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// NODE_ENV can be undefined
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
dotenv.config({ path: `env/${process.env.NODE_ENV ?? "development"}.env` });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./app/db.server/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  casing: "snake_case",
});

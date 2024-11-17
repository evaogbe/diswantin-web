import { defineConfig } from "drizzle-kit";
import { env } from "~/system.server/env";

export default defineConfig({
  schema: "./app/system.server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
  casing: "snake_case",
});

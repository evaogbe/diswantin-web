import "dotenv/config";
import * as v from "valibot";

const envSchema = v.object({
  NODE_ENV: v.optional(
    v.picklist(["production", "development", "test"]),
    "development",
  ),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  HOST: v.optional(v.string()),
});

export const env = v.parse(envSchema, process.env);

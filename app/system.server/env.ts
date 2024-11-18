import "dotenv/config";
import * as v from "valibot";

const envSchema = v.object({
  APP_ENV: v.picklist(["production", "development", "test"]),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  PUBLIC_HOST: v.pipe(v.string(), v.url()),
});

export const env = v.parse(envSchema, process.env);

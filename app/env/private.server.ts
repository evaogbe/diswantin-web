import "dotenv/config";
import * as v from "valibot";

const envSchema = v.object({
  NODE_ENV: v.optional(
    v.picklist(["production", "development", "test"]),
    "development",
  ),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  CSRF_SECRET: v.string(),
  SENTRY_DNS: v.pipe(v.string(), v.url()),
  SENTRY_PROJECT_ID: v.string(),
});

export type Env = v.InferOutput<typeof envSchema>;

function parseEnv() {
  const result = v.safeParse(envSchema, process.env);

  if (!result.success) {
    console.error("Invalid environment variables", v.flatten(result.issues));
    throw new Error("Invalid environment variables");
  }

  return result.output;
}

export const env = parseEnv();

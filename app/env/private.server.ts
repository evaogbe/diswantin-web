import dotenv from "dotenv";
import * as v from "valibot";

dotenv.config({ path: `env/${process.env.NODE_ENV ?? "development"}.env` });

const envSchema = v.object({
  NODE_ENV: v.optional(
    v.picklist(["production", "development", "test"]),
    "development",
  ),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  SESSION_SECRET: v.string(),
  CSRF_SECRET: v.string(),
  GOOGLE_CLIENT_ID: v.string(),
  GOOGLE_CLIENT_SECRET: v.string(),
  GOOGLE_REDIRECT_URI: v.pipe(v.string(), v.url()),
  SENTRY_DSN: v.pipe(v.string(), v.url()),
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

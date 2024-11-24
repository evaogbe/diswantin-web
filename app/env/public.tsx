import { serverOnly$ } from "vite-env-only/macros";
import type { Env } from "./private.server";

type PublicEnv = {
  MODE: Env["NODE_ENV"];
  SENTRY_DSN: Env["SENTRY_DSN"];
};

declare global {
  // Use interface for extensions
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ENV: PublicEnv;
  }
}

let publicEnv: unknown = {};

export const initPublicEnv = serverOnly$(async () => {
  const { env } = await import("./private.server");
  publicEnv = {
    MODE: env.NODE_ENV,
    SENTRY_DSN: env.SENTRY_DSN,
  };
});

function getPublicEnv() {
  if (typeof document !== "undefined") {
    return window.ENV;
  }
  return publicEnv as PublicEnv;
}

export function PublicEnvScript({ nonce }: { nonce?: string }) {
  const env = getPublicEnv();
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `window.ENV=${JSON.stringify(env)};`,
      }}
    />
  );
}

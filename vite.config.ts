import "dotenv/config";
import { vitePlugin as remix } from "@remix-run/dev";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { glob } from "glob";
import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  // Use interface for extensions
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    envOnlyMacros(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
    sentryVitePlugin({
      disable: process.env.NODE_ENV !== "production",
      sourcemaps: {
        filesToDeleteAfterUpload: await glob([
          "./build/server/**/*.map",
          "./dist/**/*.map",
        ]),
      },
    }),
  ],
  build: {
    target: "esnext",
    sourcemap: true,
  },
});

import { vitePlugin as remix } from "@remix-run/dev";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import dotenv from "dotenv";
import { glob } from "glob";
import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// NODE_ENV can be undefined
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
dotenv.config({ path: `env/${process.env.NODE_ENV ?? "development"}.env` });

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
    svgr(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        v3_routeConfig: true,
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

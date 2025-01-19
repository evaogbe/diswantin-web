import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import dotenv from "dotenv";
import { defineConfig } from "vite";
import { envOnlyMacros } from "vite-env-only";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

dotenv.config({ path: `env/${process.env.NODE_ENV ?? "development"}.env` });

export default defineConfig({
  plugins: [
    envOnlyMacros(),
    svgr({
      svgrOptions: {
        svgProps: {
          fill: "currentColor",
        },
      },
    }),
    reactRouter(),
    tsconfigPaths(),
    sentryVitePlugin({
      disable: process.env.NODE_ENV !== "production",
      sourcemaps: {
        filesToDeleteAfterUpload: [
          "./build/server/**/*.map",
          "./dist/**/*.map",
        ],
      },
    }),
  ],
  build: {
    target: "esnext",
    sourcemap: true,
  },
});

import * as esbuild from "esbuild";

console.log(
  await esbuild.build({
    entryPoints: ["src/index.ts", "src/monitoring.ts"],
    bundle: true,
    outdir: "dist",
    target: ["node22"],
    platform: "node",
    sourcemap: true,
    format: "esm",
    external: ["fsevents", "lightningcss"],
    inject: ["src/cjs-shim.ts"],
  }),
);

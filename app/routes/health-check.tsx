import type { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/system.server/db";
import * as table from "~/system.server/db/schema";
import { env } from "~/system.server/env";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const host =
      env.HOST ??
      request.headers.get("X-Forwarded-Host") ??
      request.headers.get("host");
    const url = new URL("/", `http://${host}`);
    await Promise.all([
      db.$count(table.task),
      fetch(url.toString(), { method: "HEAD" }).then((res) => {
        if (!res.ok) {
          throw res;
        }
      }),
    ]);
    return new Response("OK");
  } catch (e) {
    console.error("Health check ❌", e);
    return new Response("ERROR", { status: 500 });
  }
}

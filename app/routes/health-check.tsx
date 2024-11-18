import { db } from "~/system.server/db";
import * as table from "~/system.server/db/schema";
import { env } from "~/system.server/env";

export async function loader() {
  try {
    await Promise.all([
      db.$count(table.task),
      fetch(env.PUBLIC_HOST, { method: "HEAD" }).then((res) => {
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

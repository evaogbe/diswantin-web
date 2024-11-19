import { db } from "~/system.server/db";
import * as table from "~/system.server/db/schema";

export async function loader() {
  try {
    await db.$count(table.task);
    return new Response("OK");
  } catch (e) {
    console.error("Health check ❌", e);
    return new Response("ERROR", { status: 500 });
  }
}

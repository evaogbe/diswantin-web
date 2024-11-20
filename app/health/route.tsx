import { db } from "~/db.server";
import * as table from "~/db.server/schema";

export async function loader() {
  try {
    await db.$count(table.task);
    return new Response("OK");
  } catch (e) {
    console.error("Health check ❌", e);
    return new Response("ERROR", { status: 500 });
  }
}

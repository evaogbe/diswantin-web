import { eq } from "drizzle-orm";
import { db } from "~/system.server/db";
import * as table from "~/system.server/db/schema";

export async function getCurrentTask() {
  const rows = await db
    .select({ id: table.task.id, name: table.task.name })
    .from(table.task)
    .orderBy(table.task.createdAt, table.task.id)
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

export async function createTask(task: string) {
  await db.insert(table.task).values({ name: task });
}

export async function markTaskDone(id: number) {
  await db.delete(table.task).where(eq(table.task.id, id));
}

import { eq } from "drizzle-orm";
import { uid } from "uid";
import { db } from "~/system.server/db";
import * as table from "~/system.server/db/schema";

export async function getCurrentTask() {
  const rows = await db
    .select({ id: table.task.taskId, name: table.task.name })
    .from(table.task)
    .orderBy(table.task.createdAt, table.task.id)
    .limit(1);
  return rows.length > 0 ? rows[0] : null;
}

export function getNewTaskForm() {
  return { id: uid() };
}

type TaskForm = {
  id: string;
  name: string;
};

export async function createTask(task: TaskForm) {
  await db
    .insert(table.task)
    .values({ taskId: task.id, name: task.name })
    .onConflictDoNothing({ target: table.task.taskId });
}

export async function markTaskDone(id: string) {
  await db.delete(table.task).where(eq(table.task.taskId, id));
}

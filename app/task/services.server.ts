import { and, eq } from "drizzle-orm";
import { uid } from "uid";
import type { Task } from "./model";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";

export async function getCurrentTask(userId: number) {
  const [currentTask] = await db
    .select({ id: table.task.taskId, name: table.task.name })
    .from(table.task)
    .where(eq(table.task.userId, userId))
    .orderBy(table.task.createdAt, table.task.id)
    .limit(1);
  return currentTask;
}

export function getNewTaskForm() {
  return { id: uid(), name: "" };
}

export async function createTask(task: Task, userId: number) {
  await db
    .insert(table.task)
    .values({ userId, taskId: task.id, name: task.name })
    .onConflictDoNothing({ target: table.task.taskId });
}

export async function markTaskDone(taskId: string, userId: number) {
  await db
    .delete(table.task)
    .where(and(eq(table.task.taskId, taskId), eq(table.task.userId, userId)));
}

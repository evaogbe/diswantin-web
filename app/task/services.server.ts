import { and, eq, sql } from "drizzle-orm";
import type { SQLChunk } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { uid } from "uid";
import type { Task } from "./model";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";

function nullsLast(col: AnyPgColumn | SQLChunk) {
  return sql`${col} NULLS LAST`;
}

export async function getCurrentTask(userId: number) {
  const [currentTask] = await db
    .select({ id: table.task.clientId, name: table.task.name })
    .from(table.task)
    .where(eq(table.task.userId, userId))
    .orderBy(
      nullsLast(table.task.deadlineDate),
      nullsLast(table.task.deadlineTime),
      table.task.createdAt,
      table.task.id,
    )
    .limit(1);
  return currentTask;
}

export function getNewTaskForm() {
  return { id: uid(), name: "", deadlineDate: "", deadlineTime: "" };
}

export async function createTask(task: Task, userId: number) {
  await db
    .insert(table.task)
    .values({
      userId,
      clientId: task.id,
      name: task.name,
      deadlineDate: task.deadlineDate,
      deadlineTime: task.deadlineTime,
    })
    .onConflictDoNothing({ target: table.task.clientId });
}

export async function markTaskDone(taskClientId: string, userId: number) {
  await db
    .delete(table.task)
    .where(
      and(eq(table.task.clientId, taskClientId), eq(table.task.userId, userId)),
    );
}

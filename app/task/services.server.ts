import { formatISO, startOfDay } from "date-fns";
import { and, eq, isNotNull, isNull, lt, lte, or, sql } from "drizzle-orm";
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
  const now = new Date();
  const today = formatISO(now, { representation: "date" });
  const currentTime = formatISO(now, { representation: "time" });
  const midnight = formatISO(startOfDay(now), { representation: "time" });
  const [currentTask] = await db
    .select({ id: table.task.clientId, name: table.task.name })
    .from(table.task)
    .where(
      and(
        eq(table.task.userId, userId),
        or(
          isNull(table.task.scheduledDate),
          lt(table.task.scheduledDate, today),
          and(
            eq(table.task.scheduledDate, today),
            lte(table.task.scheduledTime, currentTime),
          ),
        ),
      ),
    )
    .orderBy(
      nullsLast(table.task.scheduledDate),
      nullsLast(
        sql`CASE
        WHEN ${isNotNull(table.task.scheduledTime)} THEN ${table.task.scheduledTime}
        WHEN ${isNotNull(table.task.scheduledDate)} THEN ${midnight}
        ELSE NULL
        END`,
      ),
      nullsLast(table.task.deadlineDate),
      nullsLast(table.task.deadlineTime),
      table.task.createdAt,
      table.task.id,
    )
    .limit(1);
  return currentTask;
}

export function getNewTaskForm() {
  return {
    id: uid(),
    name: "",
    deadline: {
      date: "",
      time: "",
    },
    scheduledAt: {
      date: "",
      time: "",
    },
  };
}

export async function createTask(task: Task, userId: number) {
  await db
    .insert(table.task)
    .values({
      userId,
      clientId: task.id,
      name: task.name,
      deadlineDate: task.deadline?.date,
      deadlineTime: task.deadline?.time,
      scheduledDate: task.scheduledAt?.date,
      scheduledTime: task.scheduledAt?.time,
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

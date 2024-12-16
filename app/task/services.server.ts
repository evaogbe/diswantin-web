import { parse } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import {
  and,
  desc,
  eq,
  isNotNull,
  isNull,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import type { SQLChunk } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { uid } from "uid";
import * as v from "valibot";
import { nameSchema } from "./model";
import type { TaskForm } from "./model";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";

function nullsFirst(col: AnyPgColumn | SQLChunk) {
  return sql`${col} NULLS FIRST`;
}

type User = { id: number; timeZone: string };

export async function getCurrentTask(user: User) {
  const now = new Date();
  const today = formatInTimeZone(now, user.timeZone, "yyyy-MM-dd");
  const currentTime = formatInTimeZone(now, user.timeZone, "HH:mm:ss");
  const [currentTask] = await db
    .select({ id: table.task.clientId, name: table.task.name })
    .from(table.task)
    .leftJoin(
      table.taskCompletion,
      eq(table.taskCompletion.taskId, table.task.id),
    )
    .where(
      and(
        eq(table.task.userId, user.id),
        isNull(table.taskCompletion.doneAt),
        or(
          isNull(table.task.scheduledDate),
          lt(table.task.scheduledDate, today),
          and(
            eq(table.task.scheduledDate, today),
            or(
              isNull(table.task.scheduledTime),
              lte(table.task.scheduledTime, currentTime),
            ),
          ),
        ),
        or(
          isNull(table.task.startAfterDate),
          lte(table.task.startAfterDate, today),
        ),
        or(
          isNull(table.task.startAfterTime),
          lte(table.task.startAfterTime, currentTime),
        ),
      ),
    )
    .orderBy(
      table.task.scheduledDate,
      sql`CASE
        WHEN ${isNotNull(table.task.scheduledTime)} THEN ${table.task.scheduledTime}
        WHEN ${isNotNull(table.task.scheduledDate)} THEN '00:00:00'
        ELSE NULL
        END`,
      table.task.deadlineDate,
      table.task.deadlineTime,
      nullsFirst(table.task.startAfterDate),
      nullsFirst(table.task.startAfterTime),
      table.task.createdAt,
      table.task.id,
    )
    .limit(1);
  return currentTask;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchHeadline(str: string, tokens: string[]) {
  const occurrences = tokens
    .flatMap((token) =>
      [...str.matchAll(new RegExp(escapeRegExp(token), "dgi"))].flatMap(
        (match) => match.indices ?? [],
      ),
    )
    .sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      if (a[1] < b[1]) return -1;
      if (a[1] > b[1]) return 1;
      return 0;
    });
  let last = 0;
  const headline = [];

  for (const [start, end] of occurrences) {
    if (last > start) continue;

    if (/^\s+$/.test(str.slice(last, start))) {
      const lastHeadline = headline[headline.length - 1];
      if (lastHeadline != null) {
        lastHeadline.value = `${lastHeadline.value}${str.slice(last, end)}`;
      }
    } else {
      if (last < start) {
        headline.push({ value: str.slice(last, start), highlight: false });
      }
      headline.push({ value: str.slice(start, end), highlight: true });
    }
    last = end;
  }

  if (last < str.length) {
    headline.push({ value: str.slice(last), highlight: false });
  }
  return headline;
}

export async function searchTasks(query: string, userId: number) {
  const tsquery = `${query
    .replace(/[^\w\s]/g, " ")
    .trim()
    .replace(/\s+/g, ":* & ")}:*`;
  const searchResults = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      isDone: sql<boolean>`${table.taskCompletion.doneAt} IS NOT NULL`,
    })
    .from(table.task)
    .leftJoin(
      table.taskCompletion,
      eq(table.taskCompletion.taskId, table.task.id),
    )
    .where(
      and(
        eq(table.task.userId, userId),
        sql`to_tsvector('simple', ${table.task.name}) @@ to_tsquery('simple', ${tsquery})`,
      ),
    )
    .orderBy(
      desc(
        sql`ts_rank_cd(
          to_tsvector('simple', ${table.task.name}),
          to_tsquery('simple', ${tsquery}),
          1
        )`,
      ),
    )
    .limit(30);
  const tokens = query.split(/\s+/);
  return searchResults.map((result) => ({
    ...result,
    headline: buildSearchHeadline(result.name, tokens),
  }));
}

function formatDateTime(
  date: string | null,
  time: string | null,
  timeZone: string,
) {
  if (date != null && time != null) {
    const dateTime = toDate(`${date}T${time}`, { timeZone });
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone,
    }).format(dateTime);
  }

  if (date != null) {
    const dateTime = toDate(`${date}T00:00:00`, { timeZone });
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeZone,
    }).format(dateTime);
  }

  if (time != null) {
    const dateTime = parse(time, "HH:mm:ss", new Date());
    return new Intl.DateTimeFormat("en-US", {
      timeStyle: "short",
    }).format(dateTime);
  }

  return null;
}

export async function getTaskDetail(taskClientId: string, user: User) {
  const [task] = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      deadlineDate: table.task.deadlineDate,
      deadlineTime: table.task.deadlineTime,
      startAfterDate: table.task.startAfterDate,
      startAfterTime: table.task.startAfterTime,
      scheduledDate: table.task.scheduledDate,
      scheduledTime: table.task.scheduledTime,
      isDone: sql<boolean>`${table.taskCompletion.doneAt} IS NOT NULL`,
    })
    .from(table.task)
    .leftJoin(
      table.taskCompletion,
      eq(table.taskCompletion.taskId, table.task.id),
    )
    .where(
      and(
        eq(table.task.userId, user.id),
        eq(table.task.clientId, taskClientId),
      ),
    )
    .limit(1);
  if (task == null) {
    return null;
  }

  return {
    id: task.id,
    name: task.name,
    deadline: formatDateTime(
      task.deadlineDate,
      task.deadlineTime,
      user.timeZone,
    ),
    startAfter: formatDateTime(
      task.startAfterDate,
      task.startAfterTime,
      user.timeZone,
    ),
    scheduledAt: formatDateTime(
      task.scheduledDate,
      task.scheduledTime,
      user.timeZone,
    ),
    isDone: task.isDone,
  };
}

export function getNewTaskForm(name: string | null) {
  const parseResult = v.safeParse(nameSchema, name);
  return {
    id: uid(),
    name: parseResult.success ? parseResult.output : "",
    deadline: {
      date: "",
      time: "",
    },
    startAfter: {
      date: "",
      time: "",
    },
    scheduledAt: {
      date: "",
      time: "",
    },
  };
}

export async function getEditTaskForm(taskClientId: string, userId: number) {
  const [task] = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      deadlineDate: table.task.deadlineDate,
      deadlineTime: table.task.deadlineTime,
      startAfterDate: table.task.startAfterDate,
      startAfterTime: table.task.startAfterTime,
      scheduledDate: table.task.scheduledDate,
      scheduledTime: table.task.scheduledTime,
    })
    .from(table.task)
    .where(
      and(eq(table.task.clientId, taskClientId), eq(table.task.userId, userId)),
    )
    .limit(1);
  if (task == null) {
    return null;
  }

  return {
    id: task.id,
    name: task.name,
    deadline: {
      date: task.deadlineDate ?? "",
      time: task.deadlineTime?.slice(0, 5) ?? "",
    },
    startAfter: {
      date: task.startAfterDate ?? "",
      time: task.startAfterTime?.slice(0, 5) ?? "",
    },
    scheduledAt: {
      date: task.scheduledDate ?? "",
      time: task.scheduledTime?.slice(0, 5) ?? "",
    },
  };
}

export async function createTask(task: TaskForm, userId: number) {
  await db
    .insert(table.task)
    .values({
      userId,
      clientId: task.id,
      name: task.name,
      deadlineDate: task.deadline?.date,
      deadlineTime: task.deadline?.time,
      startAfterDate: task.startAfter?.date,
      startAfterTime: task.startAfter?.time,
      scheduledDate: task.scheduledAt?.date,
      scheduledTime: task.scheduledAt?.time,
    })
    .onConflictDoNothing({ target: table.task.clientId });
}

export async function updateTask(task: TaskForm, userId: number) {
  await db
    .update(table.task)
    .set({
      name: task.name,
      deadlineDate: task.deadline?.date ?? null,
      deadlineTime: task.deadline?.time ?? null,
      startAfterDate: task.startAfter?.date ?? null,
      startAfterTime: task.startAfter?.time ?? null,
      scheduledDate: task.scheduledAt?.date ?? null,
      scheduledTime: task.scheduledAt?.time ?? null,
    })
    .where(
      and(eq(table.task.clientId, task.id), eq(table.task.userId, userId)),
    );
}

export async function deleteTask(taskClientId: string, userId: number) {
  await db
    .delete(table.task)
    .where(
      and(eq(table.task.clientId, taskClientId), eq(table.task.userId, userId)),
    );
}

export async function markTaskDone(taskClientId: string, userId: number) {
  const [task] = await db
    .select({ id: table.task.id })
    .from(table.task)
    .where(
      and(eq(table.task.clientId, taskClientId), eq(table.task.userId, userId)),
    )
    .limit(1);
  if (task == null) {
    throw new Error(`task not found: ${taskClientId} for user: ${userId}`);
  }

  const existingCompletions = await db
    .select({ exists: sql<1>`1` })
    .from(table.taskCompletion)
    .where(eq(table.taskCompletion.taskId, task.id))
    .limit(1);
  if (existingCompletions.length < 1) {
    await db.insert(table.taskCompletion).values({ taskId: task.id });
  }
}

export async function unmarkTaskDone(taskClientId: string, userId: number) {
  const [task] = await db
    .select({ id: table.task.id })
    .from(table.task)
    .where(
      and(eq(table.task.clientId, taskClientId), eq(table.task.userId, userId)),
    )
    .limit(1);
  if (task == null) {
    throw new Error(`task not found: ${taskClientId} for user: ${userId}`);
  }

  await db
    .delete(table.taskCompletion)
    .where(eq(table.taskCompletion.taskId, task.id));
}

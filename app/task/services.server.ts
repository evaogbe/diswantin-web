import { addDays, startOfDay } from "date-fns";
import {
  formatInTimeZone,
  fromZonedTime,
  toDate,
  toZonedTime,
} from "date-fns-tz";
import {
  and,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  lte,
  max,
  notExists,
  or,
  sql,
} from "drizzle-orm";
import type { InferInsertModel, InferSelectModel, SQLChunk } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { differenceWith } from "es-toolkit/array";
import { isEqual } from "es-toolkit/predicate";
import { uid } from "uid";
import * as v from "valibot";
import { formatDateTime, formatRecurrence } from "./format";
import { nameSchema, weekdays, weekdaysToIndices } from "./model";
import type { TaskForm, TaskRecurrence } from "./model";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";

function nullsFirst(col: AnyPgColumn | SQLChunk) {
  return sql`${col} NULLS FIRST`;
}

type User = { id: number; timeZone: string };

export async function getCurrentTask(user: User, now = new Date()) {
  const midnight = fromZonedTime(
    startOfDay(toZonedTime(now, user.timeZone)),
    user.timeZone,
  );
  const today = formatInTimeZone(now, user.timeZone, "yyyy-MM-dd");
  const currentTime = formatInTimeZone(now, user.timeZone, "HH:mm:ss");
  const completionQuery = db
    .select({
      taskId: table.taskCompletion.taskId,
      doneAt: max(table.taskCompletion.doneAt).as("done_at"),
    })
    .from(table.taskCompletion)
    .groupBy(table.taskCompletion.taskId)
    .as("com");
  const [currentTask] = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      note: table.task.note,
    })
    .from(table.task)
    .leftJoin(completionQuery, eq(completionQuery.taskId, table.task.id))
    .leftJoin(
      table.taskRecurrence,
      eq(table.taskRecurrence.taskId, table.task.id),
    )
    .where(
      and(
        eq(table.task.userId, user.id),
        or(
          isNull(table.taskRecurrence.start),
          lte(table.taskRecurrence.start, today),
        ),
        sql`CASE ${table.taskRecurrence.type}
          WHEN 'day'
            THEN (
              EXTRACT(JULIAN FROM TO_DATE(${today}, 'YYYY-MM-DD'))
                - EXTRACT(JULIAN FROM ${table.taskRecurrence.start})
            ) % ${table.taskRecurrence.step} = 0
          WHEN 'week'
            THEN (
              EXTRACT(JULIAN FROM TO_DATE(${today}, 'YYYY-MM-DD'))
                - EXTRACT(JULIAN FROM ${table.taskRecurrence.start})
            ) % (${table.taskRecurrence.step} * 7) = 0
          WHEN 'day_of_month'
            THEN (
              12
                + EXTRACT(MONTH FROM TO_DATE(${today}, 'YYYY-MM-DD'))
                - EXTRACT(MONTH FROM ${table.taskRecurrence.start})
            ) % ${table.taskRecurrence.step} = 0
            AND (
              EXTRACT(DAY FROM TO_DATE(${today}, 'YYYY-MM-DD'))
                = EXTRACT(DAY FROM ${table.taskRecurrence.start})
              OR (
                TO_CHAR(${table.taskRecurrence.start}, 'MM-DD')
                  IN ('01-31', '03-31', '05-31', '07-31', '08-31', '10-31', '12-31')
                AND TO_CHAR(TO_DATE(${today}, 'YYYY-MM-DD'), 'MM-DD')
                  IN ('04-30', '06-30', '09-30', '11-30')
              )
              OR (
                TO_CHAR(${table.taskRecurrence.start}, 'MM-DD')
                  IN (
                    '01-31', '02-29', '03-31', '04-30', '05-31', '06-30',
                    '07-31', '08-31', '09-30', '10-31', '11-30', '12-31'
                  )
                AND (
                  TO_CHAR(TO_DATE(${today}, 'YYYY-MM-DD'), 'MM-DD') = '02-29'
                  OR (
                    TO_CHAR(TO_DATE(${today}, 'YYYY-MM-DD'), 'MM-DD') = '02-28'
                    AND (
                      EXTRACT(YEAR FROM TO_DATE(${today}, 'YYYY-MM-DD')) % 4 != 0
                      OR (
                        EXTRACT(YEAR FROM TO_DATE(${today}, 'YYYY-MM-DD')) % 25 = 0
                        AND EXTRACT(YEAR FROM TO_DATE(${today}, 'YYYY-MM-DD')) % 16 != 0
                      )
                    )
                  )
                )
              )
            )
          WHEN 'week_of_month'
            THEN (
              12
                + EXTRACT(MONTH FROM TO_DATE(${today}, 'YYYY-MM-DD'))
                - EXTRACT(MONTH FROM ${table.taskRecurrence.start})
            ) % ${table.taskRecurrence.step} = 0
            AND CEIL(EXTRACT(DAY FROM TO_DATE(${today}, 'YYYY-MM-DD')) / 7)
              = CEIL(EXTRACT(DAY FROM ${table.taskRecurrence.start}) / 7)
            AND EXTRACT(DOW FROM TO_DATE(${today}, 'YYYY-MM-DD'))
              = EXTRACT(DOW FROM ${table.taskRecurrence.start})
          WHEN 'year'
            THEN (
              EXTRACT(YEAR FROM TO_DATE(${today}, 'YYYY-MM-DD'))
                - EXTRACT(YEAR FROM ${table.taskRecurrence.start})
            ) % ${table.taskRecurrence.step} = 0
            AND (
              TO_CHAR(TO_DATE(${today}, 'YYYY-MM-DD'), 'MM-DD')
                = TO_CHAR(${table.taskRecurrence.start}, 'MM-DD')
              OR (
                TO_CHAR(${table.taskRecurrence.start}, 'MM-DD') = '02-29'
                AND TO_CHAR(TO_DATE(${today}, 'YYYY-MM-DD'), 'MM-DD') = '02-28'
                AND (
                  EXTRACT(YEAR FROM TO_DATE(${today}, 'YYYY-MM-DD')) % 4 != 0
                  OR (
                    EXTRACT(YEAR FROM TO_DATE(${today}, 'YYYY-MM-DD')) % 25 = 0
                    AND EXTRACT(YEAR FROM TO_DATE(${today}, 'YYYY-MM-DD')) % 16 != 0
                  )
                )
              )
            )
          ELSE TRUE
          END`,
        or(
          isNull(completionQuery.doneAt),
          and(
            isNotNull(table.taskRecurrence.taskId),
            lt(completionQuery.doneAt, midnight),
          ),
        ),
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
          isNull(table.taskRecurrence.taskId),
          isNull(table.task.scheduledTime),
          lte(table.task.scheduledTime, currentTime),
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
      sql`CASE
        WHEN ${isNotNull(table.task.scheduledDate)} THEN ${table.task.scheduledDate}
        WHEN ${and(isNotNull(table.taskRecurrence.taskId), isNotNull(table.task.scheduledTime))}
          THEN ${today}
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(table.task.scheduledTime)} THEN ${table.task.scheduledTime}
        WHEN ${isNotNull(table.task.scheduledDate)} THEN TIME '00:00:00'
        ELSE NULL
        END`,
      isNull(table.taskRecurrence.taskId),
      sql`CASE
        WHEN ${isNotNull(table.task.deadlineDate)} THEN ${table.task.deadlineDate}
        WHEN ${isNotNull(table.taskRecurrence.taskId)} THEN ${today}
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(table.task.deadlineTime)} THEN ${table.task.deadlineTime}
        WHEN ${isNotNull(table.task.deadlineDate)} THEN TIME '23:59:59'
        WHEN ${isNotNull(table.taskRecurrence.taskId)} THEN TIME '23:59:59'
        ELSE NULL
        END`,
      nullsFirst(sql`CASE
        WHEN ${isNotNull(table.task.startAfterDate)} THEN ${table.task.startAfterDate}
        WHEN ${and(isNotNull(table.taskRecurrence.taskId), isNotNull(table.task.startAfterTime))}
          THEN ${today}
        ELSE NULL
        END`),
      nullsFirst(table.task.startAfterTime),
      table.task.createdAt,
      table.task.id,
    )
    .limit(1);
  return currentTask;
}

export async function searchTasks({
  query,
  user,
  cursor,
  size,
  now = new Date(),
}: {
  query: string;
  user: User;
  cursor: string | null;
  size: number;
  now?: Date;
}) {
  const midnight = fromZonedTime(
    startOfDay(toZonedTime(now, user.timeZone)),
    user.timeZone,
  );
  const [cursorRank, cursorId] = cursor?.split(":") ?? [];
  const tsquery = `${query
    .replace(/[^\w\s]/g, " ")
    .trim()
    .replace(/\s+/g, ":* & ")}:*`;
  const completionQuery = db
    .select({
      taskId: table.taskCompletion.taskId,
      doneAt: max(table.taskCompletion.doneAt).as("done_at"),
    })
    .from(table.taskCompletion)
    .groupBy(table.taskCompletion.taskId)
    .as("com");
  const page = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      isDone: sql<boolean>`${isNotNull(completionQuery.doneAt)}
        AND ${or(isNull(table.taskRecurrence.taskId), gte(completionQuery.doneAt, midnight))}`,
      rank: sql<number>`ts_rank_cd(
        to_tsvector('simple', ${table.task.name}),
        to_tsquery('simple', ${tsquery}),
        1
      )`,
    })
    .from(table.task)
    .leftJoin(completionQuery, eq(completionQuery.taskId, table.task.id))
    .leftJoin(
      table.taskRecurrence,
      eq(table.taskRecurrence.taskId, table.task.id),
    )
    .where((t) =>
      and(
        eq(table.task.userId, user.id),
        sql`to_tsvector('simple', ${table.task.name}) @@ to_tsquery('simple', ${tsquery})`,
        cursorRank != null && cursorId != null
          ? or(
              lt(t.rank, cursorRank),
              and(eq(t.rank, cursorRank), gt(t.id, cursorId)),
            )
          : undefined,
      ),
    )
    .orderBy((t) => [desc(t.rank), t.id])
    .limit(size + 1);

  return page.length <= size
    ? ([page, null] as const)
    : ([
        page.slice(0, -1),
        `${page[page.length - 2]?.rank}:${page[page.length - 2]?.id}`,
      ] as const);
}

export type TaskSearchResult = Awaited<
  ReturnType<typeof searchTasks>
>[0][number];

function recurrenceDbToRecurrence(
  recurrences: Array<
    Omit<InferSelectModel<typeof table.taskRecurrence>, "id" | "taskId">
  >,
  timeZone: string,
) {
  if (recurrences[0] == null) {
    return null;
  }

  if (recurrences[0].type === "week") {
    return {
      start: recurrences[0].start,
      type: recurrences[0].type,
      step: recurrences[0].step,
      weekdays: recurrences
        .map((recurrence) =>
          toDate(`${recurrence.start}T00:00:00`, { timeZone }),
        )
        .sort((a, b) => (a.getDay() < b.getDay() ? -1 : 1))
        .map((date) => {
          const idx = date.getDay();
          const weekday = weekdays[idx];
          if (weekday == null) {
            throw new Error(
              `Date ${date.toISOString()} on invalid weekday ${idx}`,
            );
          }
          return weekday;
        }),
    };
  }

  return {
    start: recurrences[0].start,
    type: recurrences[0].type,
    step: recurrences[0].step,
  };
}

function recurrenceToRecurrenceDb(
  recurrence: TaskRecurrence,
  taskId: number,
  timeZone: string,
) {
  if (recurrence.type === "week") {
    const start = toDate(`${recurrence.start}T00:00:00`, { timeZone });

    return recurrence.weekdays
      .map((weekday) => {
        return {
          taskId,
          start: formatInTimeZone(
            addDays(
              start,
              (7 + weekdaysToIndices[weekday] - start.getDay()) % 7,
            ),
            timeZone,
            "yyyy-MM-dd",
          ),
          type: recurrence.type,
          step: recurrence.step,
        };
      })
      .sort((a, b) => (a.start < b.start ? -1 : 1));
  }

  return [
    {
      taskId,
      start: recurrence.start,
      type: recurrence.type,
      step: recurrence.step,
    },
  ];
}

export async function getTaskDetail(
  taskClientId: string,
  user: User,
  now = new Date(),
) {
  const midnight = fromZonedTime(
    startOfDay(toZonedTime(now, user.timeZone)),
    user.timeZone,
  );
  const completionQuery = db
    .select({
      taskId: table.taskCompletion.taskId,
      doneAt: max(table.taskCompletion.doneAt).as("done_at"),
    })
    .from(table.taskCompletion)
    .groupBy(table.taskCompletion.taskId)
    .as("com");
  const [task] = await db
    .select({
      id: table.task.id,
      clientId: table.task.clientId,
      name: table.task.name,
      note: table.task.note,
      deadlineDate: table.task.deadlineDate,
      deadlineTime: table.task.deadlineTime,
      startAfterDate: table.task.startAfterDate,
      startAfterTime: table.task.startAfterTime,
      scheduledDate: table.task.scheduledDate,
      scheduledTime: table.task.scheduledTime,
      isDone: sql<boolean>`${isNotNull(completionQuery.doneAt)}
        AND ${or(isNull(table.taskRecurrence.taskId), gte(completionQuery.doneAt, midnight))}`,
    })
    .from(table.task)
    .leftJoin(completionQuery, eq(completionQuery.taskId, table.task.id))
    .leftJoin(
      table.taskRecurrence,
      eq(table.taskRecurrence.taskId, table.task.id),
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

  const dbRecurrences = await db
    .select({
      start: table.taskRecurrence.start,
      type: table.taskRecurrence.type,
      step: table.taskRecurrence.step,
    })
    .from(table.taskRecurrence)
    .where(eq(table.taskRecurrence.taskId, task.id))
    .orderBy(table.taskRecurrence.start)
    .limit(7);
  const recurrence = recurrenceDbToRecurrence(dbRecurrences, user.timeZone);

  return {
    id: task.clientId,
    name: task.name,
    note: task.note,
    recurrence:
      recurrence != null ? formatRecurrence(recurrence, user.timeZone) : null,
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

export function seqId() {
  return `${Math.floor(Date.now() / 1000)}${uid(6)}`;
}

export function getNewTaskForm(request: Request) {
  const url = new URL(request.url);
  const nameParseResult = v.safeParse(nameSchema, url.searchParams.get("name"));
  return {
    id: seqId(),
    name: nameParseResult.success ? nameParseResult.output : "",
  };
}

export async function getEditTaskForm(taskClientId: string, user: User) {
  const [task] = await db
    .select({
      id: table.task.id,
      clientId: table.task.clientId,
      name: table.task.name,
      note: table.task.note,
      deadlineDate: table.task.deadlineDate,
      deadlineTime: table.task.deadlineTime,
      startAfterDate: table.task.startAfterDate,
      startAfterTime: table.task.startAfterTime,
      scheduledDate: table.task.scheduledDate,
      scheduledTime: table.task.scheduledTime,
    })
    .from(table.task)
    .where(
      and(
        eq(table.task.clientId, taskClientId),
        eq(table.task.userId, user.id),
      ),
    )
    .limit(1);
  if (task == null) {
    return null;
  }

  const dbRecurrences = await db
    .select({
      start: table.taskRecurrence.start,
      type: table.taskRecurrence.type,
      step: table.taskRecurrence.step,
    })
    .from(table.taskRecurrence)
    .where(eq(table.taskRecurrence.taskId, task.id))
    .orderBy(table.taskRecurrence.start)
    .limit(7);

  return {
    id: task.clientId,
    name: task.name,
    note: task.note ?? "",
    recurrence:
      recurrenceDbToRecurrence(dbRecurrences, user.timeZone) ?? undefined,
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

export async function createTask(task: TaskForm, user: User) {
  return await db.transaction(async (tx) => {
    const [savedTask] = await tx
      .insert(table.task)
      .values({
        userId: user.id,
        clientId: task.id,
        name: task.name,
        note: task.note ?? null,
        deadlineDate: task.deadline?.date ?? null,
        deadlineTime: task.deadline?.time ?? null,
        startAfterDate: task.startAfter?.date ?? null,
        startAfterTime: task.startAfter?.time ?? null,
        scheduledDate: task.scheduledAt?.date ?? null,
        scheduledTime: task.scheduledAt?.time ?? null,
      })
      .onConflictDoNothing({ target: table.task.clientId })
      .returning({ id: table.task.id });
    if (savedTask == null) {
      return null;
    }

    if (task.recurrence != null) {
      await tx
        .insert(table.taskRecurrence)
        .values(
          recurrenceToRecurrenceDb(
            task.recurrence,
            savedTask.id,
            user.timeZone,
          ),
        );
    }

    return savedTask.id;
  });
}

export async function updateTask(task: TaskForm, user: User) {
  return await db.transaction(async (tx) => {
    let [savedTask] = await tx
      .update(table.task)
      .set({
        name: task.name,
        note: task.note ?? null,
        deadlineDate: task.deadline?.date ?? null,
        deadlineTime: task.deadline?.time ?? null,
        startAfterDate: task.startAfter?.date ?? null,
        startAfterTime: task.startAfter?.time ?? null,
        scheduledDate: task.scheduledAt?.date ?? null,
        scheduledTime: task.scheduledAt?.time ?? null,
      })
      .where(
        and(eq(table.task.clientId, task.id), eq(table.task.userId, user.id)),
      )
      .returning({ id: table.task.id });
    if (savedTask == null) {
      [savedTask] = await tx
        .select({ id: table.task.id })
        .from(table.task)
        .where(
          and(eq(table.task.clientId, task.id), eq(table.task.userId, user.id)),
        );
    }
    if (savedTask == null) {
      throw new Error(`Could not update task: ${JSON.stringify(task)}`);
    }

    const oldRecurrences = await tx
      .select({
        taskId: table.taskRecurrence.taskId,
        start: table.taskRecurrence.start,
        type: table.taskRecurrence.type,
        step: table.taskRecurrence.step,
      })
      .from(table.taskRecurrence)
      .where(eq(table.taskRecurrence.taskId, savedTask.id))
      .orderBy(table.taskRecurrence.start)
      .limit(7);

    const newRecurrences: Array<InferInsertModel<typeof table.taskRecurrence>> =
      task.recurrence != null
        ? recurrenceToRecurrenceDb(task.recurrence, savedTask.id, user.timeZone)
        : [];
    const recurrencesToRemove = differenceWith(
      oldRecurrences,
      newRecurrences,
      isEqual,
    );
    const recurrencesToAdd = differenceWith(
      newRecurrences,
      oldRecurrences,
      isEqual,
    );

    if (recurrencesToRemove.length > 0) {
      await tx.delete(table.taskRecurrence).where(
        and(
          eq(table.taskRecurrence.taskId, savedTask.id),
          inArray(
            table.taskRecurrence.start,
            recurrencesToRemove.map((r) => r.start),
          ),
        ),
      );
    }

    if (recurrencesToAdd.length > 0) {
      await tx.insert(table.taskRecurrence).values(recurrencesToAdd);
    }

    return savedTask.id;
  });
}

export async function deleteTask(taskClientId: string, userId: number) {
  await db
    .delete(table.task)
    .where(
      and(eq(table.task.clientId, taskClientId), eq(table.task.userId, userId)),
    );
}

export async function markTaskDone(
  taskClientId: string,
  user: User,
  now = new Date(),
) {
  const [task] = await db
    .select({ id: table.task.id })
    .from(table.task)
    .where(
      and(
        eq(table.task.clientId, taskClientId),
        eq(table.task.userId, user.id),
      ),
    )
    .limit(1);
  if (task == null) {
    console.error(`Task not found: ${taskClientId} for user: ${user.id}`);
    return;
  }

  const midnight = fromZonedTime(
    startOfDay(toZonedTime(now, user.timeZone)),
    user.timeZone,
  );
  const existingCompletions = await db
    .select({ exists: sql<1>`1` })
    .from(table.taskCompletion)
    .leftJoin(
      table.taskRecurrence,
      eq(table.taskRecurrence.taskId, table.taskCompletion.taskId),
    )
    .where(
      and(
        eq(table.taskCompletion.taskId, task.id),
        or(
          isNull(table.taskRecurrence.taskId),
          gte(table.taskCompletion.doneAt, midnight),
        ),
      ),
    )
    .limit(1);
  if (existingCompletions.length < 1) {
    await db.insert(table.taskCompletion).values({ taskId: task.id });
  }
}

export async function unmarkTaskDone(
  taskClientId: string,
  user: User,
  now = new Date(),
) {
  const [task] = await db
    .select({ id: table.task.id })
    .from(table.task)
    .where(
      and(
        eq(table.task.clientId, taskClientId),
        eq(table.task.userId, user.id),
      ),
    )
    .limit(1);
  if (task == null) {
    console.error(`Task not found: ${taskClientId} for user: ${user.id}`);
    return;
  }

  const midnight = fromZonedTime(
    startOfDay(toZonedTime(now, user.timeZone)),
    user.timeZone,
  );
  await db
    .delete(table.taskCompletion)
    .where(
      and(
        eq(table.taskCompletion.taskId, task.id),
        or(
          notExists(
            db
              .select()
              .from(table.taskRecurrence)
              .where(eq(table.taskRecurrence.taskId, task.id)),
          ),
          gte(table.taskCompletion.doneAt, midnight),
        ),
      ),
    );
}

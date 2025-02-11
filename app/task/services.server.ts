import { addDays, startOfDay } from "date-fns";
import {
  formatInTimeZone,
  fromZonedTime,
  toDate,
  toZonedTime,
} from "date-fns-tz";
import {
  aliasedTable,
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
import { createCookie } from "react-router";
import { uid } from "uid";
import * as v from "valibot";
import { formatDateTime, formatRecurrence } from "./format";
import {
  nameSchema,
  partialTaskSchema,
  weekdays,
  weekdaysToIndices,
} from "./model";
import type {
  PartialTaskForm,
  TaskForm,
  TaskParent,
  TaskRecurrence,
} from "./model";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";
import { env } from "~/env/private.server";

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
  const availableTasksQuery = db
    .select({
      id: table.task.id,
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
    );
  const leafQuery = db
    .select({
      descendant: table.taskPath.descendant,
      depth: max(table.taskPath.depth).as("depth"),
    })
    .from(table.taskPath)
    .where(
      and(
        inArray(table.taskPath.ancestor, availableTasksQuery),
        inArray(table.taskPath.descendant, availableTasksQuery),
      ),
    )
    .groupBy(table.taskPath.descendant)
    .as("leaf");
  const descendantTaskTable = aliasedTable(table.task, "des");
  const uniqueRecurrenceQuery = db
    .selectDistinct({
      taskId: table.taskRecurrence.taskId,
    })
    .from(table.taskRecurrence);
  const [currentTask] = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      note: table.task.note,
    })
    .from(table.task)
    .innerJoin(table.taskPath, eq(table.taskPath.ancestor, table.task.id))
    .innerJoin(
      leafQuery,
      and(
        eq(leafQuery.descendant, table.taskPath.descendant),
        eq(sql`"leaf"."depth"`, table.taskPath.depth),
      ),
    )
    .innerJoin(
      descendantTaskTable,
      eq(descendantTaskTable.id, table.taskPath.descendant),
    )
    .leftJoin(
      uniqueRecurrenceQuery.as("ra"),
      eq(uniqueRecurrenceQuery.as("ra").taskId, table.task.id),
    )
    .leftJoin(
      uniqueRecurrenceQuery.as("rd"),
      eq(uniqueRecurrenceQuery.as("rd").taskId, descendantTaskTable.id),
    )
    .orderBy(
      sql`CASE
        WHEN ${isNotNull(table.task.scheduledDate)} THEN ${table.task.scheduledDate}
        WHEN ${and(
          isNotNull(uniqueRecurrenceQuery.as("ra").taskId),
          isNotNull(table.task.scheduledTime),
        )}
          THEN ${today}
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(table.task.scheduledTime)} THEN ${table.task.scheduledTime}
        WHEN ${isNotNull(table.task.scheduledDate)} THEN TIME '00:00:00'
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(descendantTaskTable.scheduledDate)}
          THEN ${descendantTaskTable.scheduledDate}
        WHEN ${and(
          isNotNull(uniqueRecurrenceQuery.as("rd").taskId),
          isNotNull(descendantTaskTable.scheduledTime),
        )}
          THEN ${today}
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(descendantTaskTable.scheduledTime)}
          THEN ${descendantTaskTable.scheduledTime}
        WHEN ${isNotNull(descendantTaskTable.scheduledDate)} THEN TIME '00:00:00'
        ELSE NULL
        END`,
      isNull(uniqueRecurrenceQuery.as("rd").taskId),
      sql`CASE
        WHEN ${isNotNull(descendantTaskTable.deadlineDate)} THEN ${descendantTaskTable.deadlineDate}
        WHEN ${isNotNull(uniqueRecurrenceQuery.as("rd").taskId)} THEN ${today}
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(descendantTaskTable.deadlineTime)} THEN ${descendantTaskTable.deadlineTime}
        WHEN ${isNotNull(descendantTaskTable.deadlineDate)} THEN TIME '23:59:59'
        WHEN ${isNotNull(uniqueRecurrenceQuery.as("rd").taskId)} THEN TIME '23:59:59'
        ELSE NULL
        END`,
      nullsFirst(sql`CASE
        WHEN ${isNotNull(descendantTaskTable.startAfterDate)}
          THEN ${descendantTaskTable.startAfterDate}
        WHEN ${and(
          isNotNull(uniqueRecurrenceQuery.as("rd").taskId),
          isNotNull(descendantTaskTable.startAfterTime),
        )}
          THEN ${today}
        ELSE NULL
        END`),
      nullsFirst(descendantTaskTable.startAfterTime),
      descendantTaskTable.createdAt,
      descendantTaskTable.id,
    )
    .limit(1);
  return currentTask;
}

export async function searchTasks({
  query,
  user,
  cursor,
  now = new Date(),
}: {
  query: string;
  user: User;
  cursor: string | null;
  now?: Date;
}) {
  const size = 50;
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
  const uniqueRecurrenceQuery = db
    .selectDistinct({
      taskId: table.taskRecurrence.taskId,
    })
    .from(table.taskRecurrence)
    .as("rec");
  const page = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      isDone: sql<boolean>`${isNotNull(completionQuery.doneAt)}
        AND ${or(isNull(uniqueRecurrenceQuery.taskId), gte(completionQuery.doneAt, midnight))}`,
      rank: sql<number>`ts_rank_cd(
        to_tsvector('simple', ${table.task.name}),
        to_tsquery('simple', ${tsquery}),
        1
      )`,
    })
    .from(table.task)
    .leftJoin(completionQuery, eq(completionQuery.taskId, table.task.id))
    .leftJoin(
      uniqueRecurrenceQuery,
      eq(uniqueRecurrenceQuery.taskId, table.task.id),
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
  const lastResult = page.length <= size ? null : page[page.length - 2];

  return lastResult == null
    ? ([page, null] as const)
    : ([page.slice(0, -1), `${lastResult.rank}:${lastResult.id}`] as const);
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
  const today = formatInTimeZone(now, user.timeZone, "yyyy-MM-dd");
  const completionQuery = db
    .select({
      taskId: table.taskCompletion.taskId,
      doneAt: max(table.taskCompletion.doneAt).as("done_at"),
    })
    .from(table.taskCompletion)
    .groupBy(table.taskCompletion.taskId)
    .as("com");
  const uniqueRecurrenceQuery = db
    .selectDistinct({
      taskId: table.taskRecurrence.taskId,
    })
    .from(table.taskRecurrence)
    .as("rec");
  const parentQuery = db
    .select({
      clientId: table.task.clientId,
      name: table.task.name,
      isDone: sql<boolean>`${isNotNull(completionQuery.doneAt)}
        AND ${or(isNull(uniqueRecurrenceQuery.taskId), gte(completionQuery.doneAt, midnight))}`.as(
        "is_done",
      ),
      childId: table.taskPath.descendant,
    })
    .from(table.task)
    .innerJoin(table.taskPath, eq(table.taskPath.ancestor, table.task.id))
    .leftJoin(completionQuery, eq(completionQuery.taskId, table.task.id))
    .leftJoin(
      uniqueRecurrenceQuery,
      eq(uniqueRecurrenceQuery.taskId, table.task.id),
    )
    .where(eq(table.taskPath.depth, 1))
    .as("par");
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
        AND ${or(isNull(uniqueRecurrenceQuery.taskId), gte(completionQuery.doneAt, midnight))}`,
      parentClientId: parentQuery.clientId,
      parentName: parentQuery.name,
      parentIsDone: parentQuery.isDone,
    })
    .from(table.task)
    .leftJoin(completionQuery, eq(completionQuery.taskId, table.task.id))
    .leftJoin(
      uniqueRecurrenceQuery,
      eq(uniqueRecurrenceQuery.taskId, table.task.id),
    )
    .leftJoin(parentQuery, eq(parentQuery.childId, table.task.id))
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

  const children = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
      isDone: sql<boolean>`${isNotNull(completionQuery.doneAt)}
        AND ${or(isNull(uniqueRecurrenceQuery.taskId), gte(completionQuery.doneAt, midnight))}`,
    })
    .from(table.task)
    .innerJoin(table.taskPath, eq(table.taskPath.descendant, table.task.id))
    .leftJoin(completionQuery, eq(completionQuery.taskId, table.task.id))
    .leftJoin(
      uniqueRecurrenceQuery,
      eq(uniqueRecurrenceQuery.taskId, table.task.id),
    )
    .where(
      and(eq(table.taskPath.ancestor, task.id), eq(table.taskPath.depth, 1)),
    )
    .orderBy((t) => [
      t.isDone,
      sql`CASE
        WHEN ${isNotNull(table.task.scheduledDate)} THEN ${table.task.scheduledDate}
        WHEN ${and(isNotNull(uniqueRecurrenceQuery.taskId), isNotNull(table.task.scheduledTime))}
          THEN ${today}
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(table.task.scheduledTime)} THEN ${table.task.scheduledTime}
        WHEN ${isNotNull(table.task.scheduledDate)} THEN TIME '00:00:00'
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(table.task.deadlineDate)} THEN ${table.task.deadlineDate}
        WHEN ${isNotNull(uniqueRecurrenceQuery.taskId)} THEN ${today}
        ELSE NULL
        END`,
      sql`CASE
        WHEN ${isNotNull(table.task.deadlineTime)} THEN ${table.task.deadlineTime}
        WHEN ${isNotNull(table.task.deadlineDate)} THEN TIME '23:59:59'
        WHEN ${isNotNull(uniqueRecurrenceQuery.taskId)} THEN TIME '23:59:59'
        ELSE NULL
        END`,
      nullsFirst(sql`CASE
        WHEN ${isNotNull(table.task.startAfterDate)} THEN ${table.task.startAfterDate}
        WHEN ${and(isNotNull(uniqueRecurrenceQuery.taskId), isNotNull(table.task.startAfterTime))}
          THEN ${today}
        ELSE NULL
        END`),
      nullsFirst(table.task.startAfterTime),
      table.task.createdAt,
      table.task.id,
    ])
    .limit(20);

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
    parent:
      task.parentClientId != null && task.parentName != null
        ? {
            id: task.parentClientId,
            name: task.parentName,
            isDone: task.parentIsDone,
          }
        : null,
    children,
  };
}

const taskFormCookie = createCookie("taskForm", {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24,
});

export function savePartialTask(partialTask: PartialTaskForm) {
  return taskFormCookie.serialize(partialTask);
}

export async function saveTaskParent(
  parentForm: TaskParent,
  userId: number,
  request: Request,
) {
  const [parent] = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
    })
    .from(table.task)
    .where(
      and(
        eq(table.task.userId, userId),
        eq(table.task.clientId, parentForm.parentId),
      ),
    )
    .limit(1);
  if (parent == null) {
    throw new Error(
      `Task ${parentForm.parentId} not found for user: ${userId}`,
    );
  }

  const [existingChild] = await db
    .select({ id: table.task.clientId })
    .from(table.task)
    .where(
      and(
        eq(table.task.userId, userId),
        eq(table.task.clientId, parentForm.childId),
      ),
    )
    .limit(1);
  const partialTaskParseResult = v.safeParse(
    partialTaskSchema,
    await taskFormCookie.parse(request.headers.get("Cookie")),
  );
  const oldPartialTask =
    partialTaskParseResult.success &&
    partialTaskParseResult.output.id === parentForm.childId
      ? partialTaskParseResult.output
      : {};
  const cookie = await taskFormCookie.serialize({
    ...oldPartialTask,
    parent,
  });

  return [existingChild, cookie] as const;
}

export async function deleteTaskParent() {
  return taskFormCookie.serialize("", { maxAge: 0 });
}

export function seqId() {
  return `${Math.floor(Date.now() / 1000)}${uid(6)}`;
}

export async function getNewTaskForm(request: Request) {
  const url = new URL(request.url);
  const nameParseResult = v.safeParse(nameSchema, url.searchParams.get("name"));
  const cookieHeader = request.headers.get("Cookie");
  const savedFormParseResult = url.searchParams.has("continue")
    ? v.safeParse(partialTaskSchema, await taskFormCookie.parse(cookieHeader))
    : ({ success: false } as const);
  const partialTask = savedFormParseResult.success
    ? savedFormParseResult.output
    : {};
  const taskForm = {
    id: seqId(),
    name: nameParseResult.success ? nameParseResult.output : "",
    ...partialTask,
  };
  return [
    taskForm,
    savedFormParseResult.success
      ? await taskFormCookie.serialize(taskForm)
      : await deleteTaskParent(),
  ] as const;
}

export async function getEditTaskForm(
  taskClientId: string,
  user: User,
  request: Request,
) {
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
    return [null, await deleteTaskParent()] as const;
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

  const [parent] = await db
    .select({
      id: table.task.clientId,
      name: table.task.name,
    })
    .from(table.task)
    .innerJoin(table.taskPath, eq(table.taskPath.ancestor, table.task.id))
    .where(
      and(eq(table.taskPath.descendant, task.id), eq(table.taskPath.depth, 1)),
    )
    .limit(1);

  const url = new URL(request.url);
  const cookieHeader = request.headers.get("Cookie");
  const savedFormParseResult = url.searchParams.has("continue")
    ? v.safeParse(partialTaskSchema, await taskFormCookie.parse(cookieHeader))
    : ({ success: false } as const);
  const partialTask =
    savedFormParseResult.success &&
    savedFormParseResult.output.id === task.clientId
      ? savedFormParseResult.output
      : {};

  return [
    {
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
      parent,
      ...partialTask,
    },
    savedFormParseResult.success &&
    savedFormParseResult.output.id === task.clientId
      ? await taskFormCookie.serialize(savedFormParseResult.output)
      : await deleteTaskParent(),
  ] as const;
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

    await tx.insert(table.taskPath).values({
      ancestor: savedTask.id,
      descendant: savedTask.id,
      depth: 0,
    });

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

    if (task.parent != null) {
      const ancestorPathQuery = tx
        .select({
          ancestor: table.taskPath.ancestor,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .innerJoin(table.task, eq(table.task.id, table.taskPath.descendant))
        .where(
          and(
            eq(table.task.userId, user.id),
            eq(table.task.clientId, task.parent.id),
          ),
        )
        .as("a");
      const descendantPathQuery = tx
        .select({
          descendant: table.taskPath.descendant,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .where(eq(table.taskPath.ancestor, savedTask.id))
        .as("d");
      await tx.execute(
        sql`INSERT INTO ${table.taskPath} (ancestor, descendant, depth) ${tx
          .select({
            ancestor: ancestorPathQuery.ancestor,
            descendant: descendantPathQuery.descendant,
            depth:
              sql`${ancestorPathQuery.depth} + ${descendantPathQuery.depth} + 1`.as(
                "depth",
              ),
          })
          .from(ancestorPathQuery)
          .fullJoin(descendantPathQuery, sql`true`)
          .where(sql`true`)}`,
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
        )
        .limit(1);
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

    const [oldParent] = await tx
      .select({
        id: table.task.id,
        clientId: table.task.clientId,
      })
      .from(table.task)
      .innerJoin(table.taskPath, eq(table.taskPath.ancestor, table.task.id))
      .where(
        and(
          eq(table.taskPath.descendant, savedTask.id),
          eq(table.taskPath.depth, 1),
        ),
      )
      .limit(1);

    if (task.parent == null) {
      if (oldParent != null) {
        await tx.delete(table.taskPath).where(
          and(
            inArray(
              table.taskPath.ancestor,
              tx
                .select({ ancestor: table.taskPath.ancestor })
                .from(table.taskPath)
                .where(
                  and(
                    eq(table.taskPath.descendant, savedTask.id),
                    gt(table.taskPath.depth, 0),
                  ),
                ),
            ),
            inArray(
              table.taskPath.descendant,
              tx
                .select({ descendant: table.taskPath.descendant })
                .from(table.taskPath)
                .where(eq(table.taskPath.ancestor, savedTask.id)),
            ),
          ),
        );
      }
    } else if (oldParent?.clientId !== task.parent.id) {
      const existingPaths = await tx
        .select({
          exists: sql<1>`1`,
        })
        .from(table.taskPath)
        .innerJoin(table.task, eq(table.task.id, table.taskPath.descendant))
        .where(
          and(
            eq(table.taskPath.ancestor, savedTask.id),
            eq(table.task.clientId, task.parent.id),
          ),
        )
        .limit(1);
      if (existingPaths.length > 0) {
        await tx
          .delete(table.taskPath)
          .where(
            and(
              or(
                eq(table.taskPath.ancestor, savedTask.id),
                eq(table.taskPath.descendant, savedTask.id),
              ),
              gt(table.taskPath.depth, 0),
            ),
          );
      } else {
        await tx.delete(table.taskPath).where(
          and(
            inArray(
              table.taskPath.ancestor,
              tx
                .select({ ancestor: table.taskPath.ancestor })
                .from(table.taskPath)
                .where(
                  and(
                    eq(table.taskPath.descendant, savedTask.id),
                    gt(table.taskPath.depth, 0),
                  ),
                ),
            ),
            inArray(
              table.taskPath.descendant,
              tx
                .select({ descendant: table.taskPath.descendant })
                .from(table.taskPath)
                .where(eq(table.taskPath.ancestor, savedTask.id)),
            ),
          ),
        );
      }

      const ancestorPathQuery = tx
        .select({
          ancestor: table.taskPath.ancestor,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .innerJoin(table.task, eq(table.task.id, table.taskPath.descendant))
        .where(
          and(
            eq(table.task.userId, user.id),
            eq(table.task.clientId, task.parent.id),
          ),
        )
        .as("a");
      const descendantPathQuery = tx
        .select({
          descendant: table.taskPath.descendant,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .where(eq(table.taskPath.ancestor, savedTask.id))
        .as("d");
      await tx.execute(
        sql`INSERT INTO ${table.taskPath} (ancestor, descendant, depth) ${tx
          .select({
            ancestor: ancestorPathQuery.ancestor,
            descendant: descendantPathQuery.descendant,
            depth:
              sql`${ancestorPathQuery.depth} + ${descendantPathQuery.depth} + 1`.as(
                "depth",
              ),
          })
          .from(ancestorPathQuery)
          .fullJoin(descendantPathQuery, sql`true`)
          .where(sql`true`)}`,
      );
    }

    return savedTask.id;
  });
}

export async function deleteTask(taskClientId: string, userId: number) {
  await db.transaction(async (tx) => {
    const [parent] = await tx
      .select({
        id: table.taskPath.ancestor,
      })
      .from(table.taskPath)
      .innerJoin(table.task, eq(table.task.id, table.taskPath.descendant))
      .where(
        and(
          eq(table.task.userId, userId),
          eq(table.task.clientId, taskClientId),
          eq(table.taskPath.depth, 1),
        ),
      )
      .limit(1);
    const children = await tx
      .select({
        id: table.taskPath.descendant,
      })
      .from(table.taskPath)
      .innerJoin(table.task, eq(table.task.id, table.taskPath.ancestor))
      .where(
        and(
          eq(table.task.userId, userId),
          eq(table.task.clientId, taskClientId),
          eq(table.taskPath.depth, 1),
        ),
      );

    await tx
      .delete(table.task)
      .where(
        and(
          eq(table.task.userId, userId),
          eq(table.task.clientId, taskClientId),
        ),
      );

    if (parent != null && children.length > 0) {
      await tx
        .update(table.taskPath)
        .set({ depth: sql`${table.taskPath.depth} - 1` })
        .where(
          and(
            inArray(
              table.taskPath.ancestor,
              tx
                .select({ ancestor: table.taskPath.ancestor })
                .from(table.taskPath)
                .where(eq(table.taskPath.descendant, parent.id)),
            ),
            inArray(
              table.taskPath.descendant,
              tx
                .select({ descendant: table.taskPath.descendant })
                .from(table.taskPath)
                .where(
                  inArray(
                    table.taskPath.ancestor,
                    children.map(({ id }) => id),
                  ),
                ),
            ),
          ),
        );
    }
  });
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

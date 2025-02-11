import { relations, sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  time,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clientId: varchar({ length: 16 }).notNull().unique("user_client_id_unique"),
  googleId: varchar({ length: 255 }).notNull().unique("user_google_id_unique"),
  email: varchar({ length: 255 }).notNull().unique(),
  timeZone: varchar({ length: 255 }),
});

export const task = pgTable(
  "task",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    clientId: varchar({ length: 16 }).notNull().unique("task_client_id_unique"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    userId: integer()
      .notNull()
      .references(() => user.id, { onUpdate: "cascade", onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    note: varchar({ length: 256 }),
    deadlineDate: date(),
    deadlineTime: time(),
    startAfterDate: date(),
    startAfterTime: time(),
    scheduledDate: date(),
    scheduledTime: time(),
  },
  (table) => [
    index("task_name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`,
    ),
    index("task_user_id_index").on(table.userId),
  ],
);

export const taskCompletion = pgTable(
  "task_completion",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    doneAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    taskId: integer()
      .notNull()
      .references(() => task.id, { onUpdate: "cascade", onDelete: "cascade" }),
  },
  (table) => [
    unique("task_completion_task_id_done_at_unique").on(
      table.taskId,
      table.doneAt,
    ),
  ],
);

export const recurrenceType = pgEnum("recurrence_type", [
  "day",
  "week",
  "day_of_month",
  "week_of_month",
  "year",
]);

export const taskRecurrence = pgTable(
  "task_recurrence",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    taskId: integer()
      .notNull()
      .references(() => task.id, { onUpdate: "cascade", onDelete: "cascade" }),
    start: date().notNull(),
    type: recurrenceType().notNull(),
    step: integer().notNull(),
  },
  (table) => [
    unique("task_recurrence_task_id_start_unique").on(
      table.taskId,
      table.start,
    ),
  ],
);

export const taskPath = pgTable(
  "task_path",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    ancestor: integer()
      .notNull()
      .references(() => task.id, { onUpdate: "cascade", onDelete: "cascade" }),
    descendant: integer()
      .notNull()
      .references(() => task.id, { onUpdate: "cascade", onDelete: "cascade" }),
    depth: integer().notNull(),
  },
  (table) => [
    unique().on(table.ancestor, table.descendant),
    index().on(table.descendant),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  tasks: many(task),
}));

export const taskRelations = relations(task, ({ one, many }) => ({
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
  completions: many(taskCompletion),
  recurrences: many(taskRecurrence),
  ancestorPaths: many(taskPath, { relationName: "ancestor" }),
  descendantPaths: many(taskPath, { relationName: "descendant" }),
}));

export const taskCompletionRelations = relations(taskCompletion, ({ one }) => ({
  task: one(task, {
    fields: [taskCompletion.taskId],
    references: [task.id],
  }),
}));

export const taskRecurrenceRelations = relations(taskRecurrence, ({ one }) => ({
  task: one(task, {
    fields: [taskRecurrence.taskId],
    references: [task.id],
  }),
}));

export const taskPathRelations = relations(taskPath, ({ one }) => ({
  ancestor: one(task, {
    fields: [taskPath.ancestor],
    references: [task.id],
    relationName: "ancestor",
  }),
  descendant: one(task, {
    fields: [taskPath.descendant],
    references: [task.id],
    relationName: "descendant",
  }),
}));

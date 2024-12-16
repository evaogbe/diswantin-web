import { relations, sql } from "drizzle-orm";
import {
  char,
  date,
  index,
  integer,
  pgTable,
  time,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  clientId: char({ length: 11 }).notNull().unique(),
  googleId: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  timeZone: varchar({ length: 255 }),
});

export const task = pgTable(
  "task",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    clientId: char({ length: 11 }).notNull().unique(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    userId: integer()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    deadlineDate: date(),
    deadlineTime: time(),
    startAfterDate: date(),
    startAfterTime: time(),
    scheduledDate: date(),
    scheduledTime: time(),
  },
  (table) => [
    index("name_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.name})`,
    ),
  ],
);

export const taskCompletion = pgTable(
  "task_completion",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    doneAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    taskId: integer()
      .notNull()
      .references(() => task.id, { onDelete: "cascade" }),
  },
  (table) => [unique().on(table.doneAt, table.taskId)],
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
}));

export const taskCompletionRelations = relations(taskCompletion, ({ one }) => ({
  task: one(task, {
    fields: [taskCompletion.taskId],
    references: [task.id],
  }),
}));

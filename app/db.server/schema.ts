import { relations, sql } from "drizzle-orm";
import {
  char,
  date,
  index,
  integer,
  pgTable,
  time,
  timestamp,
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

export const userRelations = relations(user, ({ many }) => ({
  tasks: many(task),
}));

export const taskRelations = relations(task, ({ one }) => ({
  user: one(user, {
    fields: [task.userId],
    references: [user.id],
  }),
}));

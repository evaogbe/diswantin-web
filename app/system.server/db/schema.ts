import {
  char,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const task = pgTable("task", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  taskId: char({ length: 11 }).notNull().unique(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  name: varchar({ length: 255 }).notNull(),
});

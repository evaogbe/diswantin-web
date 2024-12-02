import * as v from "valibot";

const clientIdSchema = v.pipe(v.string(), v.regex(/^[0-9a-f]{11}$/));

export const taskSchema = v.object({
  id: clientIdSchema,
  name: v.pipe(
    v.string("Required"),
    v.trim(),
    v.nonEmpty("Required"),
    v.maxLength(256, "Too long"),
  ),
  deadlineDate: v.optional(
    v.pipe(v.string("Invalid date"), v.isoDate("Invalid date")),
  ),
  deadlineTime: v.optional(
    v.pipe(v.string("Invalid time"), v.isoTime("Invalid time")),
  ),
});

export type Task = v.InferOutput<typeof taskSchema>;

export const markDoneSchema = v.object({
  id: clientIdSchema,
});

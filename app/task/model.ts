import * as v from "valibot";

const clientIdSchema = v.pipe(v.string(), v.regex(/^[0-9a-f]{11}$/));

export const nameSchema = v.pipe(
  v.string("Required"),
  v.trim(),
  v.nonEmpty("Required"),
  v.maxLength(256, "Too long"),
);

const dateTimeSchema = v.object(
  {
    date: v.optional(
      v.pipe(v.string("Invalid date"), v.isoDate("Invalid date")),
    ),
    time: v.optional(
      v.pipe(v.string("Invalid time"), v.isoTime("Invalid time")),
    ),
  },
  "Invalid input",
);

export const taskSchema = v.pipe(
  v.object({
    id: clientIdSchema,
    name: nameSchema,
    deadline: v.optional(dateTimeSchema),
    startAfter: v.optional(dateTimeSchema),
    scheduledAt: v.optional(
      v.pipe(
        dateTimeSchema,
        v.check(
          (input) => input.date != null || input.time == null,
          "Must have scheduled date if scheduled time is set",
        ),
      ),
    ),
  }),
  v.partialCheck(
    [["deadline"], ["scheduledAt"]],
    (input) =>
      (input.deadline?.date == null && input.deadline?.time == null) ||
      (input.scheduledAt?.date == null && input.scheduledAt?.time == null),
    "Must not have both a deadline and a scheduled date/time",
  ),
  v.partialCheck(
    [["startAfter"], ["scheduledAt"]],
    (input) =>
      (input.startAfter?.date == null && input.startAfter?.time == null) ||
      (input.scheduledAt?.date == null && input.scheduledAt?.time == null),
    "Must not have both a start after date/time and a scheduled date/time",
  ),
);

export type TaskForm = v.InferOutput<typeof taskSchema>;

export const markDoneSchema = v.object({
  id: clientIdSchema,
});

export const unmarkDoneSchema = v.object({
  id: clientIdSchema,
});

export const deleteTaskSchema = v.object({
  id: clientIdSchema,
});

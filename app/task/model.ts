import * as v from "valibot";

const clientIdSchema = v.pipe(v.string(), v.nonEmpty(), v.maxLength(16));

export const nameSchema = v.pipe(
  v.string("Required"),
  v.trim(),
  v.nonEmpty("Required"),
  v.maxLength(256, "Too long"),
);

const recurrenceStepSchema = v.pipe(
  v.number("Required"),
  v.integer("Must be a whole number"),
  v.minValue(1, "Must be positive"),
);

export const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export const weekdaysToIndices = {
  Su: 0,
  Mo: 1,
  Tu: 2,
  We: 3,
  Th: 4,
  Fr: 5,
  Sa: 6,
};

export const recurrenceFormSchema = v.union(
  [
    v.object({
      taskId: clientIdSchema,
      start: v.pipe(v.string("required"), v.isoDate("is invalid date")),
      step: v.object({
        type: v.picklist(["day", "year"]),
        value: recurrenceStepSchema,
      }),
    }),
    v.object({
      taskId: clientIdSchema,
      start: v.pipe(v.string("required"), v.isoDate("is invalid date")),
      step: v.object({
        type: v.literal("week"),
        value: recurrenceStepSchema,
      }),
      weekdays: v.array(v.picklist(weekdays), "required"),
    }),
    v.object({
      taskId: clientIdSchema,
      start: v.pipe(v.string("required"), v.isoDate("is invalid date")),
      step: v.object({
        type: v.literal("month"),
        value: recurrenceStepSchema,
      }),
      monthType: v.picklist(["day_of_month", "week_of_month"], "required"),
    }),
  ],
  ({ issues }) => {
    const typeIssue = issues?.find((i) => v.getDotPath(i) === "step.type");
    let issue;
    switch (typeIssue?.input) {
      case "day":
      case "year": {
        issue = issues?.find(
          (i) =>
            !["step.type", "weekdays", "monthType"].includes(
              v.getDotPath(i) ?? "",
            ),
        );
        break;
      }
      case "week": {
        issue = issues?.find(
          (i) => !["step.type", "monthType"].includes(v.getDotPath(i) ?? ""),
        );
        break;
      }
      case "month": {
        issue = issues?.find(
          (i) => !["step.type", "weekdays"].includes(v.getDotPath(i) ?? ""),
        );
        break;
      }
    }

    if (issue == null) {
      return "Invalid input";
    }

    const key =
      typeof issue.path?.[0]?.key === "string"
        ? issue.path[0].key.replace(/([A-Z])/g, " $1")
        : "";
    let message =
      issue.path?.[0]?.origin === "key"
        ? `${key} required`
        : `${key} ${issue.message}`;
    message = message.trim();
    return `${message[0]?.toLocaleUpperCase()}${message.slice(1).toLocaleLowerCase()}`;
  },
);

export type TaskRecurrenceForm = v.InferOutput<typeof recurrenceFormSchema>;

export const recurrenceSchema = v.variant(
  "type",
  [
    v.object({
      start: v.pipe(v.string("Invalid date"), v.isoDate("Invalid date")),
      type: v.picklist(["day", "day_of_month", "week_of_month", "year"]),
      step: recurrenceStepSchema,
    }),
    v.object({
      start: v.pipe(v.string("Invalid date"), v.isoDate("Invalid date")),
      type: v.literal("week"),
      step: recurrenceStepSchema,
      weekdays: v.array(v.picklist(weekdays)),
    }),
  ],
  "Invalid input",
);

export type TaskRecurrence = v.InferOutput<typeof recurrenceSchema>;

export function recurrenceFormToRecurrence(values: TaskRecurrenceForm) {
  if ("weekdays" in values) {
    return {
      start: values.start,
      type: values.step.type,
      step: values.step.value,
      weekdays: values.weekdays,
    };
  }

  if ("monthType" in values) {
    return {
      start: values.start,
      type: values.monthType,
      step: values.step.value,
    };
  }

  return {
    start: values.start,
    type: values.step.type,
    step: values.step.value,
  };
}

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

export const parentSchema = v.object({
  parentId: clientIdSchema,
  childId: clientIdSchema,
});

export type TaskParent = v.InferOutput<typeof parentSchema>;

export const taskSchema = v.pipe(
  v.object({
    id: clientIdSchema,
    name: nameSchema,
    note: v.optional(
      v.pipe(v.string(), v.trim(), v.maxLength(256, "Too long")),
    ),
    recurrence: v.optional(recurrenceSchema),
    deadline: v.optional(dateTimeSchema),
    startAfter: v.optional(dateTimeSchema),
    scheduledAt: v.optional(dateTimeSchema),
    parent: v.optional(
      v.object({
        id: clientIdSchema,
        name: nameSchema,
      }),
    ),
  }),
  v.forward(
    v.partialCheck(
      [["recurrence"], ["deadline", "date"]],
      (input) => input.recurrence == null || input.deadline?.date == null,
      "Must not have a deadline date for repeating to-dos",
    ),
    ["deadline"],
  ),
  v.forward(
    v.partialCheck(
      [["recurrence"], ["startAfter", "date"]],
      (input) => input.recurrence == null || input.startAfter?.date == null,
      "Must not have a start after date for repeating to-dos",
    ),
    ["startAfter"],
  ),
  v.forward(
    v.partialCheck(
      [["recurrence"], ["scheduledAt", "date"]],
      (input) => input.recurrence == null || input.scheduledAt?.date == null,
      "Must not have a scheduled date for repeating to-dos",
    ),
    ["scheduledAt"],
  ),
  v.forward(
    v.partialCheck(
      [["recurrence"], ["scheduledAt"]],
      (input) =>
        input.recurrence != null ||
        input.scheduledAt?.date != null ||
        input.scheduledAt?.time == null,
      "Must have scheduled date if scheduled time is set",
    ),
    ["scheduledAt"],
  ),
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

export const partialTaskSchema = v.partial(taskSchema.pipe[0], ["name"]);

export type PartialTaskForm = v.InferOutput<typeof partialTaskSchema>;

export const markDoneSchema = v.object({
  id: clientIdSchema,
});

export const unmarkDoneSchema = v.object({
  id: clientIdSchema,
});

export const skipTaskSchema = v.object({
  id: clientIdSchema,
});

export const deleteTaskSchema = v.object({
  id: clientIdSchema,
});

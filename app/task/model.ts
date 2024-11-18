import * as v from "valibot";

const taskIdSchema = v.pipe(v.string(), v.regex(/^[0-9a-f]{11}$/));

export const taskSchema = v.object({
  id: taskIdSchema,
  name: v.pipe(
    v.string("Required"),
    v.trim(),
    v.nonEmpty("Required"),
    v.maxLength(256, "Too long"),
  ),
});

export type Task = v.InferOutput<typeof taskSchema>;

export const markDoneSchema = v.object({
  id: taskIdSchema,
});

import * as v from "valibot";

export const accountDeletionSchema = v.object({
  email: v.pipe(
    v.string("Required"),
    v.trim(),
    v.email("Incorrect email format"),
  ),
});

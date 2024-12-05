import * as v from "valibot";

const timeZoneSchema = v.pipe(
  v.string("Required"),
  v.nonEmpty("Required"),
  v.maxLength(255, "Too long"),
);

export const onboardingSchema = v.object({
  timeZone: timeZoneSchema,
});

export const deleteAccountSchema = v.object({
  email: v.pipe(
    v.string("Required"),
    v.trim(),
    v.email("Incorrect email format"),
  ),
});

export const editTimeZoneSchema = v.object({
  timeZone: timeZoneSchema,
});

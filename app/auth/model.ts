import * as v from "valibot";

const timeZoneSchema = v.pipe(
  v.string("Required"),
  v.nonEmpty("Required"),
  v.maxLength(255, "Too long"),
);

export const credentialsSchema = v.object({
  sub: v.string(),
  email: v.pipe(v.string(), v.email()),
});

export type Credentials = v.InferOutput<typeof credentialsSchema>;

export const onboardingSchema = v.object({
  timeZone: timeZoneSchema,
});

export const deleteUserSchema = v.object({
  email: v.pipe(
    v.string("Required"),
    v.trim(),
    v.email("Incorrect email format"),
  ),
});

export const editTimeZoneSchema = v.object({
  timeZone: timeZoneSchema,
});

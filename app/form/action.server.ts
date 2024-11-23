import { data } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import { parseWithValibot } from "conform-to-valibot";
import { CSRFError } from "remix-utils/csrf/server";
import type { GenericSchema, InferOutput } from "valibot";
import { genericError } from "./validation";
import { csrf } from "~/services.server/csrf";

export async function formAction<S extends GenericSchema>({
  formData,
  requestHeaders,
  schema,
  mutation,
  humanName,
  hiddenFields,
}: {
  formData: FormData;
  requestHeaders: Headers;
  schema: S;
  mutation: (values: InferOutput<S>) => Promise<string | null>;
  humanName: string;
  hiddenFields?: string[];
}) {
  const submission = parseWithValibot(formData, { schema });

  try {
    await csrf.validate(formData, requestHeaders);
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }

    return data(
      submission.reply({
        formErrors: [genericError(humanName)],
      }),
      500,
    );
  }

  if (submission.status !== "success") {
    for (const field of hiddenFields ?? []) {
      if (submission.error?.[field] != null) {
        Sentry.captureMessage(`Invalid ${field}`, {
          extra: { error: submission.error, humanName },
        });
        throw new Response(`Invalid ${field}`, { status: 400 });
      }
    }

    return data(submission.reply(), 422);
  }

  try {
    const error = await mutation(submission.value);
    if (error != null) {
      return data(submission.reply({ formErrors: [error] }), 422);
    }

    return null;
  } catch (e) {
    Sentry.captureException(e);
    console.error(e);
    return data(
      submission.reply({
        formErrors: [genericError(humanName)],
      }),
      500,
    );
  }
}

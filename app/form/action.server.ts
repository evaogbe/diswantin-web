import * as Sentry from "@sentry/node";
import { parseWithValibot } from "conform-to-valibot";
import { data, redirect } from "react-router";
import { CSRFError } from "remix-utils/csrf/server";
import type { GenericSchema, InferOutput } from "valibot";
import { generalError } from "./validation";
import { csrf } from "~/security/csrf.server";

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
  mutation: (
    values: InferOutput<S>,
  ) => Promise<["success", string | null] | ["error", string]>;
  humanName: string;
  hiddenFields?: string[];
}) {
  const submission = parseWithValibot(formData, { schema });

  if (submission.status !== "success") {
    for (const field of hiddenFields ?? []) {
      if (submission.error?.[field] != null) {
        Sentry.captureMessage(`Invalid ${field}`, {
          extra: { error: submission.error, humanName },
        });
        throw new Response(`Invalid ${field}`, { status: 400 });
      }
    }

    return data(submission.reply(), submission.status === "error" ? 422 : 200);
  }

  try {
    await csrf.validate(formData, requestHeaders);
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }

    return data(
      submission.reply({
        formErrors: [generalError(humanName)],
      }),
      500,
    );
  }

  try {
    const [status, result] = await mutation(submission.value);
    if (status === "error") {
      return data(submission.reply({ formErrors: [result] }), 422);
    }

    if (result == null) {
      return null;
    }

    return redirect(result, 303);
  } catch (e) {
    Sentry.captureException(e);

    if (e instanceof Response) {
      throw e;
    }

    console.error(e);
    return data(
      submission.reply({
        formErrors: [generalError(humanName)],
      }),
      500,
    );
  }
}

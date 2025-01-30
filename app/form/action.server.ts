import * as Sentry from "@sentry/node";
import { parseWithValibot } from "conform-to-valibot";
import { data, redirect } from "react-router";
import { CSRFError } from "remix-utils/csrf/server";
import type * as v from "valibot";
import { generalError } from "./validation";
import { csrf } from "~/security/csrf.server";

export async function formAction<Schema extends v.GenericSchema>({
  formData,
  requestHeaders,
  schema,
  mutation,
  humanName,
  hiddenFields,
}: {
  formData: FormData;
  requestHeaders: Headers;
  schema: Schema;
  mutation: (
    values: v.InferOutput<Schema>,
  ) => Promise<
    | { status: "success"; path?: string; init?: RequestInit }
    | { status: "error"; message: string; init?: RequestInit }
  >;
  humanName: string;
  hiddenFields?: string[];
}) {
  const submission = parseWithValibot(formData, { schema });

  if (submission.status === "error") {
    console.error("Invalid input", submission.error);
    if (hiddenFields?.some((field) => submission.error?.[field] != null)) {
      Sentry.captureMessage("Invalid hidden field", {
        extra: { errors: submission.error, humanName },
      });
      throw data("Invalid hidden field", { status: 400 });
    }

    return data(submission.reply(), 422);
  }

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await csrf.validate(formData, requestHeaders);
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof CSRFError) {
      throw data("Invalid CSRF token", { status: 403 });
    }

    return data(
      submission.reply({ formErrors: [generalError(humanName)] }),
      500,
    );
  }

  try {
    const result = await mutation(submission.value);
    if (result.status === "error") {
      return data(submission.reply({ formErrors: [result.message] }), {
        status: 422,
        ...result.init,
      });
    }

    if (result.path != null) {
      return redirect(result.path, { status: 303, ...result.init });
    }

    if (result.init != null) {
      return data(submission.reply(), result.init);
    }

    return null;
  } catch (e) {
    Sentry.captureException(e);

    if (e instanceof Response) {
      throw e;
    }

    console.error(e);
    return data(
      submission.reply({ formErrors: [generalError(humanName)] }),
      500,
    );
  }
}

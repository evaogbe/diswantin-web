import * as Sentry from "@sentry/remix";
import { parseWithValibot } from "conform-to-valibot";
import { CSRFError } from "remix-utils/csrf/server";
import type { GenericSchema, InferOutput } from "valibot";
import { genericError } from "./validation";
import { csrf } from "~/utils/csrf.server";

export async function formAction<S extends GenericSchema, Out>(
  request: Request,
  schema: S,
  mutation: (values: InferOutput<S>) => Promise<Out>,
  opts: { humanName: string; hiddenFields?: string[] },
) {
  const formData = await request.formData();
  const submission = parseWithValibot(formData, { schema });

  try {
    await csrf.validate(formData, request.headers);
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }

    return submission.reply({
      formErrors: [genericError(opts.humanName)],
    });
  }

  if (submission.status !== "success") {
    for (const field of opts.hiddenFields ?? []) {
      if (submission.error?.[field] != null) {
        Sentry.captureMessage(`Invalid ${field}`, {
          extra: { error: submission.error, humanName: opts.humanName },
        });
        throw new Response(`Invalid ${field}`, { status: 403 });
      }
    }

    return submission.reply();
  }

  try {
    return await mutation(submission.value);
  } catch (e) {
    Sentry.captureException(e);
    console.error(e);
    return submission.reply({
      formErrors: [genericError(opts.humanName)],
    });
  }
}

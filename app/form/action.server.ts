import * as Sentry from "@sentry/node";
import type { FieldValues } from "react-hook-form";
import { data, redirect } from "react-router";
import { getValidatedFormData } from "remix-hook-form";
import { CSRFError } from "remix-utils/csrf/server";
import type * as v from "valibot";
import { valibotResolver } from "./resolver";
import { generalError } from "./validation";
import { csrf } from "~/security/csrf.server";

export async function formAction<
  Schema extends v.GenericSchema,
  TFieldValues extends FieldValues = v.InferOutput<Schema> & FieldValues,
>({
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
    { status: "success"; path?: string } | { status: "error"; message: string }
  >;
  humanName: string;
  hiddenFields?: string[];
}) {
  const {
    errors,
    data: inputs,
    receivedValues: defaultValues,
  } = await getValidatedFormData<TFieldValues>(
    formData,
    valibotResolver(schema),
  );

  if (errors != null) {
    console.error("Invalid input", errors);
    if (hiddenFields?.some((field) => errors[field] != null)) {
      Sentry.captureMessage("Invalid hidden field", {
        extra: { errors, humanName },
      });
      throw data("Invalid hidden field", { status: 400 });
    }

    return data({ errors, defaultValues }, 422);
  }

  try {
    await csrf.validate(formData, requestHeaders);
  } catch (e) {
    Sentry.captureException(e);
    if (e instanceof CSRFError) {
      throw data("Invalid CSRF token", { status: 403 });
    }

    return data(
      {
        errors: { root: { message: generalError(humanName) } },
        defaultValues,
      },
      500,
    );
  }

  try {
    const result = await mutation(inputs);
    if (result.status === "error") {
      return data(
        {
          errors: { root: { message: result.message } },
          defaultValues,
        },
        422,
      );
    }

    if (result.path != null) {
      return redirect(result.path, 303);
    }

    return null;
  } catch (e) {
    Sentry.captureException(e);

    if (e instanceof Response) {
      throw e;
    }

    console.error(e);
    return data(
      {
        errors: { root: { message: generalError(humanName) } },
        defaultValues,
      },
      500,
    );
  }
}

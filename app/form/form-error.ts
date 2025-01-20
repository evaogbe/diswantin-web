import { useForm } from "react-hook-form";
import { useActionData } from "react-router";
import type { Fetcher } from "react-router";

export function useFormError(fetcher?: Fetcher<unknown>) {
  const actionData = useActionData<unknown>();
  const data = fetcher == null ? actionData : fetcher.data;
  const errors =
    typeof data === "object" && data != null && "errors" in data
      ? data.errors
      : null;
  const form = useForm({ errors: errors ?? undefined });
  return errors != null ? (form.formState.errors.root?.message ?? null) : null;
}

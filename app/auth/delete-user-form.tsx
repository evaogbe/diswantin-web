import { FormProvider, useForm } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, X } from "lucide-react";
import { useId, useState } from "react";
import { Form, Link } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { uid } from "uid";
import { deleteUserSchema } from "./model";
import { FormField, FormItem, FormLabel, FormMessage } from "~/form/field";
import { Input } from "~/form/input";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { useSearchParams } from "~/url/use-search-params";

export function DeleteUserForm({
  lastResult,
}: {
  lastResult?: SubmissionResult | null;
}) {
  const { searchParams, withSearchParam, withoutSearchParam } =
    useSearchParams();
  const initialFormId = useId();
  const [formId, setFormId] = useState(`form-${initialFormId}`);
  const [form, fields] = useForm({
    id: formId,
    lastResult,
    constraint: getValibotConstraint(deleteUserSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: deleteUserSchema });
    },
  });

  if (searchParams.has("delete-account")) {
    return (
      <FormProvider context={form.context}>
        <Form
          method="post"
          id={form.id}
          noValidate={form.noValidate}
          aria-labelledby={`${form.id}-title`}
          aria-describedby={form.errors != null ? form.errorId : undefined}
          onSubmit={form.onSubmit}
          className="mt-sm space-y-xs rounded-xl border bg-card p-sm text-card-foreground shadow"
        >
          <header className="flex items-center justify-between">
            <CardTitle id={`${form.id}-title`}>Danger Zone</CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link
                to={withoutSearchParam("delete-account")}
                replace
                preventScrollReset
                aria-label="Close"
                onClick={() => {
                  setFormId(`form-${uid()}`);
                }}
              >
                <X />
              </Link>
            </Button>
          </header>
          <p>
            <strong>Warning: Deleting your account cannot be undone</strong>
          </p>
          <p>
            Enter the email associated with your account to permanently delete
            your account
          </p>
          {form.errors != null && (
            <Alert
              variant="destructive"
              id={form.errorId}
              aria-labelledby={`${form.errorId}-heading`}
            >
              <AlertCircle aria-hidden="true" className="size-xs" />
              <AlertTitle level={4} id={`${form.errorId}-heading`}>
                Error deleting account
              </AlertTitle>
              <AlertDescription>{form.errors[0]}</AlertDescription>
            </Alert>
          )}
          <div hidden>
            <AuthenticityTokenInput />
          </div>
          <FormField
            name={fields.email.name}
            render={({ field, control }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  {...field}
                  defaultValue={control.initialValue}
                  type="email"
                  autoComplete="email"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <p>
            <Button name="intent" value="delete-account" variant="secondary">
              Delete account
            </Button>
          </p>
        </Form>
      </FormProvider>
    );
  }

  return (
    <Card aria-labelledby="danger-zone-heading" className="mt-sm">
      <CardHeader>
        <CardTitle id="danger-zone-heading" className="flex h-lg items-center">
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <Button variant="destructive" asChild>
            <Link
              to={withSearchParam("delete-account")}
              replace
              preventScrollReset
            >
              Delete account
            </Link>
          </Button>
        </p>
      </CardContent>
    </Card>
  );
}

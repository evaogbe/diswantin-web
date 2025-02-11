import type { SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, X } from "lucide-react";
import { Form, Link, useNavigation, useSearchParams } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import { deleteUserSchema } from "./model";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  getFormProps,
} from "~/form/form";
import { useIdGenerator } from "~/form/id-generator";
import { Input } from "~/form/input";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { PendingButton } from "~/ui/pending-button";
import { useScrollIntoView } from "~/ui/scroll-into-view";
import { withSearchParam, withoutSearchParam } from "~/url/search-params";

export function DeleteUserForm({
  lastResult,
  lastIntent,
}: {
  lastResult?: SubmissionResult | null;
  lastIntent: string | null;
}) {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const [formId, genFormId] = useIdGenerator();
  const [form, fields] = useForm({
    id: formId,
    lastResult,
    constraint: getValibotConstraint(deleteUserSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, { schema: deleteUserSchema });
    },
  });
  const formError = lastIntent === "delete-account" ? form.errors?.[0] : null;
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);

  if (searchParams.has("delete-account")) {
    return (
      <FormProvider context={form.context}>
        <Form
          {...getFormProps(form)}
          method="post"
          aria-labelledby={`${form.id}-title`}
          aria-describedby={formError != null ? form.errorId : undefined}
          className={twJoin(
            "space-y-fl-xs bg-card p-fl-sm text-card-foreground relative rounded-xl border shadow-sm",
            navigation.state === "submitting" && "**:cursor-wait",
          )}
        >
          <header>
            <CardTitle id={`${form.id}-title`} className="me-fl-xs">
              Danger Zone
            </CardTitle>
            <Link
              to={withoutSearchParam(searchParams, "delete-account")}
              replace
              preventScrollReset
              aria-label="Close"
              onClick={() => {
                genFormId();
              }}
              className="end-fl-xs top-fl-xs ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            >
              <X className="size-fl-xs" />
            </Link>
          </header>
          <p className="break-words">
            <strong>Warning: Deleting your account cannot be undone</strong>
          </p>
          <p className="break-words">
            Enter the email associated with your account to permanently delete
            your account
          </p>
          {formError != null && (
            <Alert
              variant="destructive"
              id={form.errorId}
              aria-labelledby={`${form.errorId}-heading`}
              ref={formErrorRef}
            >
              <AlertCircle aria-hidden="true" className="size-fl-xs" />
              <AlertTitle level={4} id={`${form.errorId}-heading`}>
                Error deleting account
              </AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
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
                  defaultValue={control.defaultValue}
                  type="email"
                  autoComplete="email"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <p>
            <PendingButton
              pending={
                lastIntent === "delete-account" &&
                navigation.state === "submitting"
              }
              pendingText="Deleting…"
              name="intent"
              value="delete-account"
              variant="secondary"
            >
              Delete account
            </PendingButton>
          </p>
        </Form>
      </FormProvider>
    );
  }

  return (
    <Card aria-labelledby="danger-zone-heading">
      <CardHeader>
        <CardTitle id="danger-zone-heading">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          <Button variant="destructive" asChild>
            <Link
              to={withSearchParam(searchParams, "delete-account")}
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

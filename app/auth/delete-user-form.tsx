import { AlertCircle, X } from "lucide-react";
import { Form, Link } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { deleteUserSchema } from "./model";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  useForm,
} from "~/form/form";
import { Input } from "~/form/input";
import { useIntents } from "~/form/intents";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { cn } from "~/ui/classes";
import { PendingButton } from "~/ui/pending-button";
import { useScrollIntoView } from "~/ui/scroll-into-view";
import { useSearchParams } from "~/url/search-params";

export function DeleteUserForm() {
  const { searchParams, withSearchParam, withoutSearchParam } =
    useSearchParams();
  const lastIntent = useIntents();
  const form = useForm({
    schema: deleteUserSchema,
    defaultValues: { email: "" },
  });
  const formError = lastIntent === "delete-account" ? form.error : null;
  const formErrorRef = useScrollIntoView<HTMLElement>([formError]);

  if (searchParams.has("delete-account")) {
    return (
      <FormProvider form={form}>
        <Form
          method="post"
          id={form.id}
          noValidate={form.noValidate}
          aria-labelledby={form.titleId}
          aria-describedby={formError != null ? form.errorId : undefined}
          onSubmit={form.onSubmit}
          className={cn(
            "mt-sm space-y-xs rounded-xl border bg-card p-sm text-card-foreground shadow",
            form.formState.isSubmitting && "[&_*]:cursor-wait",
          )}
        >
          <header className="flex items-center justify-between">
            <CardTitle id={form.titleId}>Danger Zone</CardTitle>
            <Button variant="ghost" size="icon" asChild>
              <Link
                to={withoutSearchParam("delete-account")}
                replace
                preventScrollReset
                aria-label="Close"
                onClick={() => {
                  form.reset();
                }}
              >
                <X />
              </Link>
            </Button>
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
              aria-labelledby={form.errorHeadingId}
              ref={formErrorRef}
            >
              <AlertCircle aria-hidden="true" className="size-xs" />
              <AlertTitle level={4} id={form.errorHeadingId}>
                Error deleting account
              </AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <div hidden>
            <AuthenticityTokenInput />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" autoComplete="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p>
            <PendingButton
              pending={form.formState.isSubmitting}
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

import { FormProvider, useForm } from "@conform-to/react";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, CalendarDays, CalendarOff, X } from "lucide-react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { useHydrated } from "remix-utils/use-hydrated";
import { newTaskSchema } from "./model";
import { createTask, getNewTaskForm } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import {
  FormField,
  FormFieldSet,
  FormItem,
  FormLabel,
  FormLegend,
  FormMessage,
} from "~/form/field";
import { Input } from "~/form/input";
import { generalError } from "~/form/validation";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";
import { useSearchParams } from "~/url/use-search-params";

export function loader() {
  const taskForm = getNewTaskForm();
  return { taskForm };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
  const result = await formAction({
    formData,
    requestHeaders: request.headers,
    schema: newTaskSchema,
    mutation: async (values) => {
      await createTask(values, user.id);
      return null;
    },
    humanName: "create the to-do",
    hiddenFields: ["id"],
  });
  return result ?? redirect("/home", 303);
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "New to-do", error }) }];
};

export default function NewTaskRoute() {
  const { taskForm } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const { searchParams, withSearchParam, withoutSearchParam } =
    useSearchParams();
  const isHydrated = useHydrated();
  const [form, fields] = useForm({
    lastResult,
    constraint: getValibotConstraint(newTaskSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate({ formData }) {
      const submission = parseWithValibot(formData, { schema: newTaskSchema });
      if (submission.status === "error") {
        const field = ["id", "deadline", "scheduledAt"].find(
          (name) => submission.error?.[name] != null,
        );
        if (field != null) {
          Sentry.captureMessage(`Invalid ${field}`, {
            extra: { error: submission.error, humanName: "create the to-do" },
          });
        }
      }
      return submission;
    },
    defaultValue: taskForm,
  });
  const showDeadline = !searchParams.has("scheduled");
  const showScheduledAt = searchParams.has("scheduled");
  const formError =
    form.errors?.[0] ??
    (fields.id.errors != null ||
    (fields.deadline.errors != null && !showDeadline) ||
    (fields.scheduledAt.errors != null && !showScheduledAt)
      ? generalError("create the to-do")
      : null);
  const deadline = fields.deadline.getFieldset();
  const scheduledAt = fields.scheduledAt.getFieldset();

  return (
    <Page asChild>
      <div>
        <FormProvider context={form.context}>
          <Form
            method="post"
            id={form.id}
            noValidate={form.noValidate}
            aria-labelledby={`${form.id}-title`}
            aria-describedby={formError != null ? form.errorId : undefined}
            autoComplete="off"
            onSubmit={form.onSubmit}
            className="space-y-xs sm:px-lg"
          >
            <PageHeading id={`${form.id}-title`}>New to-do</PageHeading>
            {formError != null && (
              <Alert
                variant="destructive"
                id={form.errorId}
                aria-labelledby={`${form.errorId}-heading`}
              >
                <AlertCircle aria-hidden="true" className="size-xs" />
                <AlertTitle id={`${form.errorId}-heading`}>
                  Error adding to-do
                </AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div hidden>
              <AuthenticityTokenInput />
              <input
                type="hidden"
                name={fields.id.name}
                defaultValue={fields.id.initialValue}
              />
            </div>
            <FormField
              name={fields.name.name}
              render={({ field, control }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input {...field} defaultValue={control.initialValue} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <p>
              {searchParams.has("scheduled") ? (
                <Button variant="outline" asChild>
                  <Link
                    to={withoutSearchParam("scheduled")}
                    replace
                    preventScrollReset
                  >
                    <CalendarOff />
                    Unschedule
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link
                    to={withSearchParam("scheduled")}
                    replace
                    preventScrollReset
                  >
                    <CalendarDays />
                    Schedule
                  </Link>
                </Button>
              )}
            </p>
            {showDeadline && (
              <FormFieldSet name={fields.deadline.name} className="border p-xs">
                <FormLegend>Deadline</FormLegend>
                <div className="flex flex-wrap gap-2xs">
                  <FormField
                    name={deadline.date.name}
                    render={({ field, control }) => (
                      <FormItem className="flex-[1_11rem]">
                        <FormLabel>Date</FormLabel>
                        <span className="flex gap-4xs">
                          <Input
                            {...field}
                            value={control.value ?? ""}
                            onChange={control.onChange}
                            type="date"
                            className="flex-1"
                          />
                          <Button
                            {...form.update.getButtonProps({
                              name: field.name,
                              value: "",
                            })}
                            variant="ghost"
                            size="icon"
                            aria-label="Clear"
                          >
                            <X />
                          </Button>
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={deadline.time.name}
                    render={({ field, control }) => (
                      <FormItem className="flex-[1_11rem]">
                        <FormLabel>Time</FormLabel>
                        <span className="flex gap-4xs">
                          <Input
                            {...field}
                            value={control.value ?? ""}
                            onChange={control.onChange}
                            type="time"
                            className="flex-1"
                          />
                          <Button
                            {...form.update.getButtonProps({
                              name: field.name,
                              value: "",
                            })}
                            variant="ghost"
                            size="icon"
                            aria-label="Clear"
                          >
                            <X />
                          </Button>
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage />
              </FormFieldSet>
            )}
            {showScheduledAt && (
              <FormFieldSet
                name={fields.scheduledAt.name}
                className="border p-xs"
              >
                <FormLegend>Scheduled at</FormLegend>
                <div className="flex flex-wrap gap-2xs">
                  <FormField
                    name={scheduledAt.date.name}
                    render={({ field, control }) => (
                      <FormItem className="flex-[1_11rem]">
                        <FormLabel>Date</FormLabel>
                        <span className="flex gap-4xs">
                          <Input
                            {...field}
                            value={control.value ?? ""}
                            onChange={control.onChange}
                            type="date"
                            className="flex-1"
                          />
                          <Button
                            {...form.update.getButtonProps({
                              name: fields.scheduledAt.name,
                              value: { date: "", time: "" },
                            })}
                            variant="ghost"
                            size="icon"
                            aria-label="Clear"
                          >
                            <X />
                          </Button>
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isHydrated || scheduledAt.date.value != null ? (
                    <FormField
                      name={scheduledAt.time.name}
                      render={({ field, control }) => (
                        <FormItem className="flex-[1_11rem]">
                          <FormLabel>Time</FormLabel>
                          <span className="flex gap-4xs">
                            <Input
                              {...field}
                              value={control.value ?? ""}
                              onChange={control.onChange}
                              type="time"
                              className="flex-1"
                            />
                            <Button
                              {...form.update.getButtonProps({
                                name: field.name,
                                value: "",
                              })}
                              variant="ghost"
                              size="icon"
                              aria-label="Clear"
                            >
                              <X />
                            </Button>
                          </span>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <span className="flex-[1_11rem]" />
                  )}
                </div>
                <FormMessage />
              </FormFieldSet>
            )}
            <p className="flex justify-end">
              <Button>Save</Button>
            </p>
          </Form>
        </FormProvider>
      </div>
    </Page>
  );
}

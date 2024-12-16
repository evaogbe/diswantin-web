import { FormProvider, useForm } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { Form, Link } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, CalendarDays, CalendarOff, X } from "lucide-react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { taskSchema } from "./model";
import type { TaskForm } from "./model";
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
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";
import { useSearchParams } from "~/url/use-search-params";

export function TaskForm({
  taskForm,
  lastResult,
  humanName,
  title,
  errorHeading,
}: {
  taskForm: TaskForm;
  lastResult?: SubmissionResult | null;
  humanName: string;
  title: string;
  errorHeading: string;
}) {
  const { searchParams, withSearchParam } = useSearchParams();
  const [form, fields] = useForm({
    lastResult,
    constraint: getValibotConstraint(taskSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate({ formData }) {
      const submission = parseWithValibot(formData, { schema: taskSchema });
      if (submission.status === "error") {
        const field = ["id", "deadline", "startAfter", "scheduledAt"].find(
          (name) => submission.error?.[name] != null,
        );
        if (field != null) {
          Sentry.captureMessage(`Invalid ${field}`, {
            extra: { error: submission.error, humanName },
          });
        }
      }
      return submission;
    },
    defaultValue: {
      ...taskForm,
      deadline:
        searchParams.get("scheduled") === "1"
          ? { date: "", time: "" }
          : taskForm.deadline,
      startAfter:
        searchParams.get("scheduled") === "1"
          ? { date: "", time: "" }
          : taskForm.startAfter,
      scheduledAt:
        searchParams.get("scheduled") === "0"
          ? { date: "", time: "" }
          : taskForm.scheduledAt,
    },
  });
  const showScheduledAt =
    searchParams.get("scheduled") === "1" ||
    (searchParams.get("scheduled") !== "0" &&
      Boolean(taskForm.scheduledAt?.date));
  const formError =
    form.errors?.[0] ??
    (fields.id.errors != null ||
    (fields.deadline.errors != null && showScheduledAt) ||
    (fields.startAfter.errors != null && showScheduledAt) ||
    (fields.scheduledAt.errors != null && !showScheduledAt)
      ? generalError(humanName)
      : null);
  const deadline = fields.deadline.getFieldset();
  const startAfter = fields.startAfter.getFieldset();
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
            <PageHeading id={`${form.id}-title`}>{title}</PageHeading>
            {formError != null && (
              <Alert
                variant="destructive"
                id={form.errorId}
                aria-labelledby={`${form.errorId}-heading`}
              >
                <AlertCircle aria-hidden="true" className="size-xs" />
                <AlertTitle id={`${form.errorId}-heading`}>
                  {errorHeading}
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
              {showScheduledAt ? (
                <Button variant="outline" asChild>
                  <Link
                    to={withSearchParam("scheduled", "0")}
                    replace
                    preventScrollReset
                    onClick={() => {
                      form.update({
                        name: fields.scheduledAt.name,
                        value: { date: "", time: "" },
                      });
                    }}
                  >
                    <CalendarOff />
                    Unschedule
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link
                    to={withSearchParam("scheduled", "1")}
                    replace
                    preventScrollReset
                    onClick={() => {
                      form.update({
                        name: fields.deadline.name,
                        value: { date: "", time: "" },
                      });
                      form.update({
                        name: fields.startAfter.name,
                        value: { date: "", time: "" },
                      });
                    }}
                  >
                    <CalendarDays />
                    Schedule
                  </Link>
                </Button>
              )}
            </p>
            {!showScheduledAt && (
              <>
                <FormFieldSet
                  name={fields.deadline.name}
                  className="border p-xs"
                >
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
                <FormFieldSet
                  name={fields.startAfter.name}
                  className="border p-xs"
                >
                  <FormLegend>Start after</FormLegend>
                  <div className="flex flex-wrap gap-2xs">
                    <FormField
                      name={startAfter.date.name}
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
                      name={startAfter.time.name}
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
              </>
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
                  {scheduledAt.date.value != null ? (
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

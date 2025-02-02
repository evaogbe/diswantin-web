import type { FormValue, SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import * as Sentry from "@sentry/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import {
  AlertCircle,
  CalendarDays,
  CalendarOff,
  RotateCcw,
  X,
} from "lucide-react";
import { useState } from "react";
import { Form, Link, useNavigation, useSearchParams } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import { formatRecurrence } from "./format";
import { recurrenceSchema, taskSchema } from "./model";
import type { TaskForm, TaskRecurrence } from "./model";
import { TaskRecurrenceForm } from "./task-recurrence-form";
import {
  FormField,
  FormFieldSet,
  FormItem,
  FormLabel,
  FormLegend,
  FormMessage,
  getFormProps,
} from "~/form/form";
import { useIdGenerator } from "~/form/id-generator";
import { Input } from "~/form/input";
import { TextArea } from "~/form/text-area";
import { generalError } from "~/form/validation";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { PendingButton } from "~/ui/pending-button";
import { useScrollIntoView } from "~/ui/scroll-into-view";
import { Sheet, SheetTrigger } from "~/ui/sheet";
import { withSearchParam } from "~/url/search-params";

function parseRecurrence(recurrence: FormValue<TaskRecurrence> | string) {
  if (typeof recurrence !== "object") {
    return null;
  }

  const formData = new FormData();
  formData.set("start", recurrence.start ?? "");
  formData.set("type", recurrence.type ?? "");
  formData.set("step", recurrence.step ?? "");

  if ("weekdays" in recurrence) {
    if (typeof recurrence.weekdays === "string") {
      formData.set("weekdays", recurrence.weekdays);
    } else if (Array.isArray(recurrence.weekdays)) {
      for (const weekday of recurrence.weekdays) {
        if (weekday != null) {
          formData.append("weekdays", weekday);
        }
      }
    }
  }

  const submission = parseWithValibot(formData, { schema: recurrenceSchema });
  return submission.status === "success" ? submission.value : null;
}

export function TaskForm({
  initialValues,
  lastResult,
  timeZone,
  humanName,
  title,
  errorHeading,
}: {
  initialValues: TaskForm;
  lastResult?: SubmissionResult | null;
  timeZone: string;
  humanName: string;
  title: string;
  errorHeading: string;
}) {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const [form, fields] = useForm({
    lastResult,
    constraint: getValibotConstraint(taskSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    defaultValue: {
      ...initialValues,
      deadline:
        searchParams.get("scheduled") === "1"
          ? undefined
          : initialValues.deadline,
      startAfter:
        searchParams.get("scheduled") === "1"
          ? undefined
          : initialValues.startAfter,
      scheduledAt:
        searchParams.get("scheduled") === "0"
          ? undefined
          : initialValues.scheduledAt,
    },
    onValidate: ({ formData }) => {
      const submission = parseWithValibot(formData, { schema: taskSchema });
      if (submission.status === "error") {
        const hasHiddenError = (
          ["id", "deadline", "startAfter", "scheduledAt"] as const
        ).some((prefix) =>
          Object.keys(submission.error ?? {}).some((name) =>
            name.startsWith(prefix),
          ),
        );
        if (hasHiddenError) {
          Sentry.captureMessage("Task form invalid", {
            extra: { errors: submission.error, humanName },
          });
        }
      }
      return submission;
    },
  });
  const recurrence = fields.recurrence.getFieldset();
  const deadline = fields.deadline.getFieldset();
  const startAfter = fields.startAfter.getFieldset();
  const scheduledAt = fields.scheduledAt.getFieldset();
  const parsedRecurrence = parseRecurrence(fields.recurrence.value);
  const showScheduledAt =
    searchParams.get("scheduled") === "1" ||
    (searchParams.get("scheduled") !== "0" &&
      Boolean(
        initialValues.scheduledAt?.date || initialValues.scheduledAt?.time,
      ));
  const formError =
    form.errors?.[0] ??
    (fields.id.errors != null ||
    (Boolean(fields.recurrence.value) &&
      (deadline.date.errors != null ||
        startAfter.date.errors != null ||
        scheduledAt.date.errors != null)) ||
    (fields.deadline.errors != null && showScheduledAt) ||
    (fields.startAfter.errors != null && showScheduledAt) ||
    (fields.scheduledAt.errors != null && !showScheduledAt)
      ? generalError(humanName)
      : null);
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);
  const [recurrenceFormDialogOpen, setRecurrenceFormDialogOpen] =
    useState(false);
  const [recurrenceFormId, genRecurrenceFormId] = useIdGenerator();

  return (
    <Sheet
      open={recurrenceFormDialogOpen}
      onOpenChange={setRecurrenceFormDialogOpen}
    >
      <Page asChild className="px-fl-sm-2xl">
        <div>
          <FormProvider context={form.context}>
            <Form
              {...getFormProps(form)}
              method="post"
              aria-labelledby={`${form.id}-title`}
              autoComplete="off"
              className={twJoin(
                "space-y-fl-sm",
                navigation.state === "submitting" && "[&_*]:cursor-wait",
              )}
            >
              <PageHeading id={`${form.id}-title`} className="-mb-fl-2xs">
                {title}
              </PageHeading>
              {formError != null && (
                <Alert
                  variant="destructive"
                  id={form.errorId}
                  aria-labelledby={`${form.errorId}-heading`}
                  ref={formErrorRef}
                >
                  <AlertCircle aria-hidden="true" className="size-fl-xs" />
                  <AlertTitle id={`${form.errorId}-heading`}>
                    {errorHeading}
                  </AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              <div hidden>
                <AuthenticityTokenInput />
                <input
                  name={fields.id.name}
                  defaultValue={fields.id.initialValue}
                  type="hidden"
                />
              </div>
              <FormField
                name={fields.name.name}
                render={({ field, control }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <Input {...field} defaultValue={control.defaultValue} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={fields.note.name}
                kind="textarea"
                render={({ field, control }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <TextArea
                      {...field}
                      defaultValue={control.defaultValue}
                      rows={3}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={fields.recurrence.name}
                kind="minimal"
                render={({ field }) => (
                  <FormItem className="items-start">
                    <FormLabel>Repeats</FormLabel>
                    {parsedRecurrence != null ? (
                      <span className="flex items-center gap-fl-4xs">
                        <input
                          type="hidden"
                          name={recurrence.start.name}
                          value={recurrence.start.value ?? ""}
                        />
                        <input
                          type="hidden"
                          name={recurrence.type.name}
                          value={recurrence.type.value ?? ""}
                        />
                        <input
                          type="hidden"
                          name={recurrence.step.name}
                          value={recurrence.step.value ?? ""}
                        />
                        {typeof recurrence.weekdays.value === "string" && (
                          <input
                            type="hidden"
                            name={recurrence.weekdays.name}
                            value={recurrence.weekdays.value}
                          />
                        )}
                        {Array.isArray(recurrence.weekdays.value) &&
                          recurrence.weekdays.value.map((weekday) => (
                            <input
                              key={weekday}
                              type="hidden"
                              name={recurrence.weekdays.name}
                              value={weekday ?? ""}
                            />
                          ))}
                        <SheetTrigger asChild>
                          <Button
                            {...field}
                            variant="secondary"
                            onClick={() => {
                              genRecurrenceFormId();
                            }}
                          >
                            <RotateCcw />
                            {formatRecurrence(parsedRecurrence, timeZone)}
                          </Button>
                        </SheetTrigger>
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
                    ) : (
                      <SheetTrigger asChild>
                        <Button {...field} variant="outline">
                          <RotateCcw /> Does not repeat
                        </Button>
                      </SheetTrigger>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p>
                {showScheduledAt ? (
                  <Button variant="outline" asChild>
                    <Link
                      to={withSearchParam(searchParams, "scheduled", "0")}
                      replace
                      preventScrollReset
                      onClick={() => {
                        form.update({
                          name: fields.scheduledAt.name,
                          value: "",
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
                      to={withSearchParam(searchParams, "scheduled", "1")}
                      replace
                      preventScrollReset
                      onClick={() => {
                        form.update({
                          name: fields.deadline.name,
                          value: "",
                        });
                        form.update({
                          name: fields.startAfter.name,
                          value: "",
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
                    className="border p-fl-xs"
                  >
                    <FormLegend>Deadline</FormLegend>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(100%/3+0.1%,(25rem-100%)*1000,100%/2+0.1%),1fr))] gap-fl-2xs">
                      {!fields.recurrence.value && (
                        <FormField
                          name={deadline.date.name}
                          render={({ field, control }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <span className="flex items-center gap-fl-4xs">
                                <Input
                                  {...field}
                                  value={control.value}
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
                      )}
                      <FormField
                        name={deadline.time.name}
                        render={({ field, control }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <span className="flex items-center gap-fl-4xs">
                              <Input
                                {...field}
                                value={control.value}
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
                    className="border p-fl-xs"
                  >
                    <FormLegend>Start after</FormLegend>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(100%/3+0.1%,(25rem-100%)*1000,100%/2+0.1%),1fr))] gap-fl-2xs">
                      {!fields.recurrence.value && (
                        <FormField
                          name={startAfter.date.name}
                          render={({ field, control }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <span className="flex items-center gap-fl-4xs">
                                <Input
                                  {...field}
                                  value={control.value}
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
                      )}
                      <FormField
                        name={startAfter.time.name}
                        render={({ field, control }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <span className="flex items-center gap-fl-4xs">
                              <Input
                                {...field}
                                value={control.value}
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
                  className="border p-fl-xs"
                >
                  <FormLegend>Scheduled at</FormLegend>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(100%/3+0.1%,(25rem-100%)*1000,100%/2+0.1%),1fr))] gap-fl-2xs">
                    {!fields.recurrence.value && (
                      <FormField
                        name={scheduledAt.date.name}
                        render={({ field, control }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <span className="flex items-center gap-fl-4xs">
                              <Input
                                {...field}
                                value={control.value}
                                onChange={control.onChange}
                                type="date"
                                className="flex-1"
                              />
                              <Button
                                {...form.update.getButtonProps({
                                  name: fields.scheduledAt.name,
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
                    )}
                    {Boolean(
                      fields.recurrence.value || scheduledAt.date.value,
                    ) && (
                      <FormField
                        name={scheduledAt.time.name}
                        render={({ field, control }) => (
                          <FormItem>
                            <FormLabel>Time</FormLabel>
                            <span className="flex items-center gap-fl-4xs">
                              <Input
                                {...field}
                                value={control.value}
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
                    )}
                  </div>
                  <FormMessage />
                </FormFieldSet>
              )}
              <p className="flex justify-end">
                <PendingButton
                  pending={navigation.state === "submitting"}
                  pendingText="Saving…"
                  name="intent"
                  value="save-task"
                >
                  Save
                </PendingButton>
              </p>
            </Form>
          </FormProvider>
        </div>
      </Page>
      <TaskRecurrenceForm
        initialValues={
          typeof fields.recurrence.value === "object"
            ? fields.recurrence.value
            : undefined
        }
        onValuesChange={(recurrence) => {
          form.update({
            name: fields.recurrence.name,
            value: recurrence,
          });
          setRecurrenceFormDialogOpen(false);
        }}
        taskId={fields.id.value}
        formId={recurrenceFormId}
        timeZone={timeZone}
      />
    </Sheet>
  );
}

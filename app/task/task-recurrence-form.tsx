import type { DefaultValue, SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { formatInTimeZone, toDate, toZonedTime } from "date-fns-tz";
import { AlertCircle } from "lucide-react";
import { useFetcher } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import {
  recurrenceFormSchema,
  recurrenceFormToRecurrence,
  weekdays,
} from "./model";
import type { TaskRecurrence } from "./model";
import {
  FormField,
  FormFieldSet,
  FormItem,
  FormLabel,
  FormLegend,
  FormMessage,
  getCollectionProps,
  getFormProps,
} from "~/form/form";
import { Input } from "~/form/input";
import { Select } from "~/form/select";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { PendingButton } from "~/ui/pending-button";
import { useScrollIntoView } from "~/ui/scroll-into-view";
import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from "~/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "~/ui/toggle-group";

function getDefaultValues(
  values: DefaultValue<TaskRecurrence>,
  taskId: string | undefined,
  timeZone: string,
) {
  if (values?.type == null) {
    return {
      taskId,
      start: formatInTimeZone(new Date(), timeZone, "yyyy-MM-dd"),
      step: { type: "day" as const, value: 1 },
    };
  }

  if ("weekdays" in values) {
    return {
      taskId,
      start: values.start,
      step: { type: values.type, value: values.step },
      weekdays: values.weekdays,
    };
  }

  if (values.type === "day_of_month" || values.type === "week_of_month") {
    return {
      taskId,
      start: values.start,
      step: { type: "month" as const, value: values.step },
      monthType: values.type,
    };
  }

  return {
    taskId,
    start: values.start,
    step: { type: values.type, value: values.step },
  };
}

export function TaskRecurrenceForm({
  initialValues,
  onValuesChange,
  taskId,
  formId,
  timeZone,
}: {
  initialValues: DefaultValue<TaskRecurrence>;
  onValuesChange: (values: TaskRecurrence) => void;
  taskId?: string;
  formId: string;
  timeZone: string;
}) {
  const fetcher = useFetcher<SubmissionResult | null>();
  const [form, fields] = useForm({
    id: formId,
    lastResult: fetcher.data,
    constraint: getValibotConstraint(recurrenceFormSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    defaultValue: { ...getDefaultValues(initialValues, taskId, timeZone) },
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, { schema: recurrenceFormSchema });
    },
    onSubmit: (_, ctx) => {
      if (ctx.submission?.status === "success") {
        onValuesChange(recurrenceFormToRecurrence(ctx.submission.value));
      }
    },
  });
  const formErrorRef = useScrollIntoView<HTMLElement>(form.errors);
  const step = fields.step.getFieldset();

  return (
    <SheetContent
      aria-describedby={undefined}
      className="overflow-auto max-sm:min-w-52"
    >
      <FormProvider context={form.context}>
        <fetcher.Form
          {...getFormProps(form)}
          method="post"
          aria-describedby={form.errors != null ? form.errorId : undefined}
          className={twJoin(
            "space-y-fl-sm",
            fetcher.state === "submitting" && "**:cursor-wait",
          )}
        >
          <SheetHeader>
            <SheetTitle className="me-fl-xs">To-do repetition</SheetTitle>
          </SheetHeader>
          {form.errors != null && (
            <Alert
              variant="destructive"
              id={form.errorId}
              aria-labelledby={`${form.errorId}-heading`}
              ref={formErrorRef}
            >
              <AlertCircle aria-hidden="true" className="size-fl-xs" />
              <AlertTitle id={`${form.errorId}-heading`}>
                Error adding repetition
              </AlertTitle>
              <AlertDescription>{form.errors[0]}</AlertDescription>
            </Alert>
          )}
          <div hidden>
            <AuthenticityTokenInput />
            <input
              name={fields.taskId.name}
              defaultValue={fields.taskId.initialValue}
              type="hidden"
            />
          </div>
          <FormField
            name={fields.start.name}
            render={({ field, control }) => (
              <FormItem>
                <FormLabel>Start</FormLabel>
                <Input
                  {...field}
                  defaultValue={control.defaultValue}
                  type="date"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormFieldSet name={fields.step.name} className="space-y-fl-3xs">
            <FormLegend>Every</FormLegend>
            <div className="gap-fl-2xs flex flex-wrap">
              <FormField
                name={step.value.name}
                render={({ field, control }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Step</FormLabel>
                    <Input
                      {...field}
                      defaultValue={control.defaultValue}
                      type="number"
                      className="max-w-fl-2xl"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={step.type.name}
                kind="select"
                render={({ field, control }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Unit</FormLabel>
                    <Select
                      {...field}
                      value={control.value}
                      onChange={(e) => {
                        control.onChange(e);
                        switch (e.target.value) {
                          case "week": {
                            const start = fields.start.value
                              ? toDate(`${fields.start.value}T00:00:00`, {
                                  timeZone,
                                })
                              : toZonedTime(new Date(), timeZone);
                            form.update({
                              name: fields.weekdays.name,
                              value: [weekdays[start.getDay()]],
                            });
                            break;
                          }
                          case "month": {
                            form.update({
                              name: fields.monthType.name,
                              value: "day_of_month",
                            });
                            break;
                          }
                        }
                      }}
                    >
                      <option value="day">
                        {step.value.value === "1" ? "day" : "days"}
                      </option>
                      <option value="week">
                        {step.value.value === "1" ? "week" : "weeks"}
                      </option>
                      <option value="month">
                        {step.value.value === "1" ? "month" : "months"}
                      </option>
                      <option value="year">
                        {step.value.value === "1" ? "year" : "years"}
                      </option>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormMessage />
          </FormFieldSet>
          {step.type.value === "week" && (
            <FormFieldSet
              name={fields.weekdays.name}
              className="space-y-fl-2xs"
            >
              <FormLegend>Weekdays</FormLegend>
              <div className="gap-fl-2xs flex flex-wrap">
                {getCollectionProps(fields.weekdays, form, {
                  type: "checkbox",
                  options: weekdays,
                  controlled: true,
                }).map((field) => (
                  <label
                    key={field.value}
                    className="size-fl-lg focus-within:ring-ring hover:bg-muted hover:text-muted-foreground has-checked:bg-accent has-checked:text-accent-foreground inline-flex items-center justify-center rounded-full border text-sm font-medium whitespace-nowrap transition-colors focus-within:ring-1"
                  >
                    <input {...field} className="sr-only" />
                    {field.value}
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormFieldSet>
          )}
          {step.type.value === "month" && (
            <FormField
              name={fields.monthType.name}
              render={({ field, control }) => (
                <div>
                  <input
                    type="hidden"
                    name={field.name}
                    value={control.value}
                  />
                  <ToggleGroup
                    type="single"
                    variant="segmented"
                    value={control.value}
                    onValueChange={control.onValueChange}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="day_of_month">
                      Day of month
                    </ToggleGroupItem>
                    <ToggleGroupItem value="week_of_month">
                      Week of month
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <FormMessage />
                </div>
              )}
            />
          )}
          <SheetFooter>
            <PendingButton
              pending={fetcher.state === "submitting"}
              pendingText="Saving…"
              type="submit"
              variant="secondary"
              name="intent"
              value="save-recurrence"
            >
              Save
            </PendingButton>
          </SheetFooter>
        </fetcher.Form>
      </FormProvider>
    </SheetContent>
  );
}

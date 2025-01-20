import * as Sentry from "@sentry/react";
import { AlertCircle, CalendarDays, CalendarOff, X } from "lucide-react";
import { Form, Link } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { taskSchema } from "./model";
import type { TaskForm } from "./model";
import {
  FormControl,
  FormField,
  FormFieldSet,
  FormItem,
  FormLabel,
  FormLegend,
  FormMessage,
  FormProvider,
  useForm,
} from "~/form/form";
import { Input } from "~/form/input";
import { TextArea } from "~/form/text-area";
import { generalError } from "~/form/validation";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";
import { cn } from "~/ui/classes";
import { PendingButton } from "~/ui/pending-button";
import { useSearchParams } from "~/url/use-search-params";

export function TaskForm({
  taskForm,
  humanName,
  title,
  errorHeading,
}: {
  taskForm: TaskForm;
  humanName: string;
  title: string;
  errorHeading: string;
}) {
  const { searchParams, withSearchParam } = useSearchParams();
  const form = useForm({
    schema: taskSchema,
    defaultValues: {
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
    onInvalid: (errors) => {
      const hasHiddenError = (
        ["id", "deadline", "startAfter", "scheduledAt"] as const
      ).some((prefix) =>
        Object.keys(errors).some((name) => name.startsWith(prefix)),
      );
      if (hasHiddenError) {
        Sentry.captureMessage("Task form invalid", {
          extra: { errors, humanName },
        });
      }
    },
  });
  const scheduledDate = form.watch("scheduledAt.date");
  const showScheduledAt =
    searchParams.get("scheduled") === "1" ||
    (searchParams.get("scheduled") !== "0" &&
      Boolean(taskForm.scheduledAt?.date));
  const formError =
    form.error ??
    (form.formState.errors.id != null ||
    (form.formState.errors.deadline != null && showScheduledAt) ||
    (form.formState.errors.startAfter != null && showScheduledAt) ||
    (form.formState.errors.scheduledAt != null && !showScheduledAt)
      ? generalError(humanName)
      : null);

  return (
    <Page asChild className="px-sm-lg">
      <div>
        <FormProvider form={form}>
          <Form
            method="post"
            id={form.id}
            noValidate={form.noValidate}
            aria-labelledby={form.titleId}
            aria-describedby={formError != null ? form.errorId : undefined}
            autoComplete="off"
            onSubmit={form.onSubmit}
            className={cn(
              "space-y-xs",
              form.formState.isSubmitting && "[&_*]:cursor-wait",
            )}
          >
            <PageHeading id={form.titleId}>{title}</PageHeading>
            {formError != null && (
              <Alert
                variant="destructive"
                id={form.errorId}
                aria-labelledby={form.errorHeadingId}
              >
                <AlertCircle aria-hidden="true" className="size-xs" />
                <AlertTitle id={form.errorHeadingId}>{errorHeading}</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div hidden>
              <AuthenticityTokenInput />
              <input {...form.register("id")} type="hidden" />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl kind="textarea">
                    <TextArea {...field} rows={3} />
                  </FormControl>
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
                      form.setValue("scheduledAt", { date: "", time: "" });
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
                      form.setValue("deadline", { date: "", time: "" });
                      form.setValue("startAfter", { date: "", time: "" });
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
                <FormFieldSet name="deadline" className="border p-xs">
                  <FormLegend>Deadline</FormLegend>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(100%/3+0.1%,(25rem-100%)*1000,100%/2+0.1%),1fr))] gap-2xs">
                    <FormField
                      control={form.control}
                      name="deadline.date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <span className="flex items-center gap-4xs">
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label="Clear"
                              onClick={() => {
                                form.setValue("deadline.date", "");
                              }}
                            >
                              <X />
                            </Button>
                          </span>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deadline.time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <span className="flex items-center gap-4xs">
                            <FormControl>
                              <Input
                                {...field}
                                type="time"
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label="Clear"
                              onClick={() => {
                                form.setValue("deadline.time", "");
                              }}
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
                <FormFieldSet name="startAfter" className="border p-xs">
                  <FormLegend>Start after</FormLegend>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(100%/3+0.1%,(25rem-100%)*1000,100%/2+0.1%),1fr))] gap-2xs">
                    <FormField
                      control={form.control}
                      name="startAfter.date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <span className="flex items-center gap-4xs">
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label="Clear"
                              onClick={() => {
                                form.setValue("startAfter.date", "");
                              }}
                            >
                              <X />
                            </Button>
                          </span>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startAfter.time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <span className="flex items-center gap-4xs">
                            <FormControl>
                              <Input
                                {...field}
                                type="time"
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label="Clear"
                              onClick={() => {
                                form.setValue("startAfter.time", "");
                              }}
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
              <FormFieldSet name="scheduledAt" className="border p-xs">
                <FormLegend>Scheduled at</FormLegend>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(100%/3+0.1%,(25rem-100%)*1000,100%/2+0.1%),1fr))] gap-2xs">
                  <FormField
                    control={form.control}
                    name="scheduledAt.date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <span className="flex items-center gap-4xs">
                          <FormControl>
                            <Input {...field} type="date" className="flex-1" />
                          </FormControl>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            aria-label="Clear"
                            onClick={() => {
                              form.setValue(
                                "scheduledAt",
                                {
                                  date: "",
                                  time: "",
                                },
                                { shouldTouch: true },
                              );
                            }}
                          >
                            <X />
                          </Button>
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {Boolean(scheduledDate) && (
                    <FormField
                      control={form.control}
                      name="scheduledAt.time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <span className="flex items-center gap-4xs">
                            <FormControl>
                              <Input
                                {...field}
                                type="time"
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              aria-label="Clear"
                              onClick={() => {
                                form.setValue("scheduledAt.time", "");
                              }}
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
                pending={form.formState.isSubmitting}
                pendingText="Saving…"
              >
                Save
              </PendingButton>
            </p>
          </Form>
        </FormProvider>
      </div>
    </Page>
  );
}

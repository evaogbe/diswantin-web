import type { SubmissionResult } from "@conform-to/dom";
import { FormProvider, useForm } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, Check, ChevronsUpDown, X } from "lucide-react";
import { useRef } from "react";
import { Form, Link, useNavigation, useSearchParams } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import { editTimeZoneSchema } from "./model";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  getFormProps,
} from "~/form/form";
import { useIdGenerator } from "~/form/id-generator";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { CardTitle } from "~/ui/card";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/ui/command";
import { PendingButton } from "~/ui/pending-button";
import { Popover, PopoverTrigger, PopoverContent } from "~/ui/popover";
import { useScrollIntoView } from "~/ui/scroll-into-view";
import { withoutSearchParam } from "~/url/search-params";

export function EditTimeZoneForm({
  timeZones,
  initialTimeZone,
  lastResult,
  lastIntent,
}: {
  timeZones: string[];
  initialTimeZone: string;
  lastResult?: SubmissionResult | null;
  lastIntent: string | null;
}) {
  const [searchParams] = useSearchParams();
  const timeZoneButtonRef = useRef<HTMLButtonElement>(null);
  const navigation = useNavigation();
  const [formId, genFormId] = useIdGenerator();
  const [form, fields] = useForm({
    id: formId,
    lastResult,
    constraint: getValibotConstraint(editTimeZoneSchema),
    defaultValue: { timeZone: initialTimeZone },
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, { schema: editTimeZoneSchema });
    },
  });
  const formError = lastIntent === "update-time-zone" ? form.errors?.[0] : null;
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);

  return (
    <FormProvider context={form.context}>
      <Form
        {...getFormProps(form)}
        method="post"
        aria-labelledby={`${form.id}-title`}
        className={twJoin(
          "space-y-fl-xs bg-card p-fl-sm text-card-foreground relative rounded-xl border shadow",
          navigation.state === "submitting" && "[&_*]:cursor-wait",
        )}
      >
        <header>
          <CardTitle id={`${form.id}-title`} className="me-fl-xs">
            Edit time zone
          </CardTitle>
          <Link
            to={withoutSearchParam(searchParams, "update-time-zone")}
            replace
            preventScrollReset
            aria-label="Close"
            onClick={() => {
              genFormId();
            }}
            className="end-fl-xs top-fl-xs ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
          >
            <X className="size-fl-xs" />
          </Link>
        </header>
        {formError != null && (
          <Alert
            variant="destructive"
            id={form.errorId}
            aria-labelledby={`${form.errorId}-heading`}
            ref={formErrorRef}
          >
            <AlertCircle aria-hidden="true" className="size-fl-xs" />
            <AlertTitle id={`${form.errorId}-heading`}>
              Error editing time zone
            </AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div hidden>
          <AuthenticityTokenInput />
        </div>
        <FormField
          name={fields.timeZone.name}
          kind="select"
          render={({ field, control }) => (
            <FormItem className="max-w-96">
              <FormLabel
                htmlFor={undefined}
                onClick={() => {
                  timeZoneButtonRef.current?.focus();
                }}
              >
                Time zone
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    ref={timeZoneButtonRef}
                    className={twJoin(
                      "justify-between",
                      !control.value && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {control.value || "Select time zone"}
                    </span>
                    <ChevronsUpDown
                      aria-hidden="true"
                      className="ms-fl-2xs shrink-0 opacity-50"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search time zones…" />
                    <CommandList>
                      <CommandEmpty>No time zone found.</CommandEmpty>
                      <CommandGroup>
                        {timeZones.map((timeZone) => (
                          <CommandItem
                            key={timeZone}
                            value={timeZone}
                            onSelect={control.onValueChange}
                          >
                            {timeZone}
                            <Check
                              aria-label="Selected"
                              className={twJoin(
                                "ms-auto",
                                timeZone === control.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" name={field.name} value={control.value} />
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="flex justify-end">
          <PendingButton
            pending={
              lastIntent === "update-time-zone" &&
              navigation.state === "submitting"
            }
            pendingText="Saving…"
            name="intent"
            value="update-time-zone"
            variant="secondary"
          >
            Save
          </PendingButton>
        </p>
      </Form>
    </FormProvider>
  );
}

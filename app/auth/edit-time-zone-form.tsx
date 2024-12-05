import { FormProvider, useForm } from "@conform-to/react";
import type { SubmissionResult } from "@conform-to/react";
import { Form, Link } from "@remix-run/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, Check, ChevronsUpDown, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { uid } from "uid";
import { editTimeZoneSchema } from "./model";
import { FormField, FormItem, FormLabel, FormMessage } from "~/form/field";
import { NativeSelect } from "~/form/select";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { CardTitle } from "~/ui/card";
import { cn } from "~/ui/classes";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "~/ui/popover";
import { useSearchParams } from "~/url/use-search-params";

export function EditTimeZoneForm({
  lastResult,
  timeZones,
  initialTimeZone,
}: {
  lastResult?: SubmissionResult | null;
  timeZones: string[];
  initialTimeZone: string;
}) {
  const { withoutSearchParam } = useSearchParams();
  const timeZoneCombobox = useRef<HTMLButtonElement>(null);
  const initialFormId = useId();
  const [formId, setFormId] = useState(`form-${initialFormId}`);
  const [form, fields] = useForm({
    id: formId,
    lastResult,
    constraint: getValibotConstraint(editTimeZoneSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: editTimeZoneSchema });
    },
    defaultValue: { timeZone: initialTimeZone },
  });

  return (
    <FormProvider context={form.context}>
      <Form
        method="post"
        id={form.id}
        noValidate={form.noValidate}
        aria-labelledby={`${form.id}-title`}
        aria-describedby={form.errors != null ? form.errorId : undefined}
        onSubmit={form.onSubmit}
        className="space-y-xs rounded-xl border bg-card p-sm text-card-foreground shadow"
      >
        <header className="flex items-center justify-between">
          <CardTitle id={`${form.id}-title`}>Edit time zone</CardTitle>
          <Button variant="ghost" size="icon" asChild>
            <Link
              to={withoutSearchParam("update-time-zone")}
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
        {form.errors != null && (
          <Alert
            variant="destructive"
            id={form.errorId}
            aria-labelledby={`${form.errorId}-heading`}
          >
            <AlertCircle aria-hidden="true" className="size-xs" />
            <AlertTitle id={`${form.errorId}-heading`}>
              Error editing time zone
            </AlertTitle>
            <AlertDescription>{form.errors[0]}</AlertDescription>
          </Alert>
        )}
        <div hidden>
          <AuthenticityTokenInput />
        </div>
        <FormField
          name={fields.timeZone.name}
          type="select"
          render={({ field, control }) => (
            <FormItem className="flex flex-col">
              <FormLabel
                htmlFor={undefined}
                onClick={() => timeZoneCombobox.current?.focus()}
              >
                Time zone
              </FormLabel>
              <ClientOnly
                fallback={
                  <NativeSelect {...field} defaultValue={control.initialValue}>
                    {timeZones.map((timeZone) => (
                      <option key={timeZone} value={timeZone}>
                        {timeZone}
                      </option>
                    ))}
                  </NativeSelect>
                }
              >
                {() => (
                  <>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          ref={timeZoneCombobox}
                          className={cn(
                            "w-full justify-between sm:w-96",
                            !control.value && "text-muted-foreground",
                          )}
                        >
                          <span className="truncate">
                            {control.value ?? "Select time zone"}
                          </span>
                          <ChevronsUpDown
                            aria-hidden="true"
                            className="ms-2xs shrink-0 opacity-50"
                          />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 sm:w-96">
                        <Command>
                          <CommandInput placeholder="Search time zones…" />
                          <CommandList>
                            <CommandEmpty>No time zone found.</CommandEmpty>
                            <CommandGroup>
                              {timeZones.map((timeZone) => (
                                <CommandItem
                                  key={timeZone}
                                  value={timeZone}
                                  onSelect={() => {
                                    form.update({
                                      name: field.name,
                                      value: timeZone,
                                    });
                                  }}
                                >
                                  {timeZone}
                                  <Check
                                    aria-label="Selected"
                                    className={cn(
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
                    <input
                      type="hidden"
                      name={field.name}
                      value={control.value ?? ""}
                    />
                  </>
                )}
              </ClientOnly>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="flex justify-end">
          <Button name="intent" value="update-time-zone" variant="secondary">
            Save
          </Button>
        </p>
      </Form>
    </FormProvider>
  );
}

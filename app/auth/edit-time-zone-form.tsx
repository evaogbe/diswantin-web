import { AlertCircle, Check, ChevronsUpDown, X } from "lucide-react";
import { useRef } from "react";
import { Form, Link } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { editTimeZoneSchema } from "./model";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  useForm,
} from "~/form/form";
import { useIntents } from "~/form/intents";
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
import { PendingButton } from "~/ui/pending-button";
import { Popover, PopoverTrigger, PopoverContent } from "~/ui/popover";
import { useScrollIntoView } from "~/ui/scroll-into-view";
import { useSearchParams } from "~/url/search-params";

export function EditTimeZoneForm({
  timeZones,
  initialTimeZone,
}: {
  timeZones: string[];
  initialTimeZone: string;
}) {
  const { withoutSearchParam } = useSearchParams();
  const timeZoneButtonRef = useRef<HTMLButtonElement>(null);
  const lastIntent = useIntents();
  const form = useForm({
    schema: editTimeZoneSchema,
    defaultValues: { timeZone: initialTimeZone },
  });
  const formError = lastIntent === "update-time-zone" ? form.error : null;
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);

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
          "mt-xs space-y-xs rounded-xl border bg-card p-sm text-card-foreground shadow",
          form.formState.isSubmitting && "[&_*]:cursor-wait",
        )}
      >
        <header className="flex items-center justify-between">
          <CardTitle id={form.titleId}>Edit time zone</CardTitle>
          <Button variant="ghost" size="icon" asChild>
            <Link
              to={withoutSearchParam("update-time-zone")}
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
        {formError != null && (
          <Alert
            variant="destructive"
            id={form.errorId}
            aria-labelledby={form.errorHeadingId}
            ref={formErrorRef}
          >
            <AlertCircle aria-hidden="true" className="size-xs" />
            <AlertTitle id={form.errorHeadingId}>
              Error editing time zone
            </AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div hidden>
          <AuthenticityTokenInput />
        </div>
        <FormField
          control={form.control}
          name="timeZone"
          render={({ field }) => (
            <FormItem className="flex max-w-96 flex-col">
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
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">
                      {field.value || "Select time zone"}
                    </span>
                    <ChevronsUpDown
                      aria-hidden="true"
                      className="ms-2xs shrink-0 opacity-50"
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
                            onSelect={() => {
                              form.setValue("timeZone", timeZone);
                            }}
                          >
                            {timeZone}
                            <Check
                              aria-label="Selected"
                              className={cn(
                                "ms-auto",
                                timeZone === field.value
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
              <input type="hidden" name={field.name} value={field.value} />
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="flex justify-end">
          <PendingButton
            pending={form.formState.isSubmitting}
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

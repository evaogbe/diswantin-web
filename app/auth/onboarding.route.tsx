import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import type { Route } from "./+types/onboarding.route";
import { onboardingSchema } from "./model";
import { getAuthenticatedUser, updateTimeZone } from "./services.server";
import { formAction } from "~/form/action.server";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormProvider,
  useForm,
} from "~/form/form";
import type { UseFormReturn } from "~/form/form";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { cn } from "~/ui/classes";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/ui/command";
import { PendingButton } from "~/ui/pending-button";
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/popover";
import { useScrollIntoView } from "~/ui/scroll-into-view";

export async function loader({ request }: Route.LoaderArgs) {
  await getAuthenticatedUser(request, { fresh: true });
  return { timeZones: Intl.supportedValuesOf("timeZone") };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthenticatedUser(request, { fresh: true });
  const formData = await request.formData();
  return formAction({
    formData,
    requestHeaders: request.headers,
    schema: onboardingSchema,
    mutation: async ({ timeZone }) => {
      if (!Intl.supportedValuesOf("timeZone").includes(timeZone)) {
        throw new Response(`Time zone not supported: ${timeZone}`, {
          status: 400,
        });
      }

      await updateTimeZone(user.id, timeZone);
      return { status: "success", path: "/home" };
    },
    humanName: "set up your account",
  });
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Account setup", error }) }];
}

function useSetTimeZone(
  timeZones: string[],
  form: UseFormReturn<typeof onboardingSchema>,
) {
  useEffect(() => {
    const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!form.getValues("timeZone") && timeZones.includes(defaultTimeZone)) {
      form.setValue("timeZone", defaultTimeZone);
    }
  }, [timeZones, form]);
}

export default function OnboardingRoute({ loaderData }: Route.ComponentProps) {
  const { timeZones } = loaderData;
  const timeZoneButtonRef = useRef<HTMLButtonElement>(null);
  const form = useForm<typeof onboardingSchema>({
    schema: onboardingSchema,
    defaultValues: { timeZone: "" },
  });
  const formErrorRef = useScrollIntoView<HTMLElement>(form.error);
  useSetTimeZone(timeZones, form);

  return (
    <Page asChild className="px-sm-lg">
      <div>
        <FormProvider form={form}>
          <Form
            method="post"
            id={form.id}
            noValidate={form.noValidate}
            aria-labelledby={form.titleId}
            aria-describedby={form.error != null ? form.errorId : undefined}
            onSubmit={form.onSubmit}
            className={cn(
              "flex flex-col space-y-xs",
              form.formState.isSubmitting && "[&_*]:cursor-wait",
            )}
          >
            <PageHeading id={form.titleId}>Account setup</PageHeading>
            {form.error != null && (
              <Alert
                variant="destructive"
                id={form.errorId}
                aria-labelledby={form.errorHeadingId}
                ref={formErrorRef}
              >
                <AlertCircle aria-hidden="true" className="size-xs" />
                <AlertTitle id={form.errorHeadingId}>
                  Error setting up account
                </AlertTitle>
                <AlertDescription>{form.error}</AlertDescription>
              </Alert>
            )}
            <div hidden>
              <AuthenticityTokenInput />
            </div>
            <FormField
              control={form.control}
              name="timeZone"
              render={({ field }) => (
                <FormItem className="flex w-full max-w-96 flex-col self-center">
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
                        data-testid="time-zone-button"
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
                          className="shrink-0 opacity-50"
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

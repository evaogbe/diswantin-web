import { FormProvider, useForm } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import type { Route } from "./+types/onboarding.route";
import { onboardingSchema } from "./model";
import { getAuthenticatedUser, updateTimeZone } from "./services.server";
import { formAction } from "~/form/action.server";
import { FormField, FormItem, FormLabel, FormMessage } from "~/form/field";
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
import { Popover, PopoverContent, PopoverTrigger } from "~/ui/popover";

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
      return ["success", "/home"];
    },
    humanName: "set up your account",
  });
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Account setup", error }) }];
}

export default function OnboardingRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { timeZones } = loaderData;
  const timeZoneButtonRef = useRef<HTMLButtonElement>(null);
  const [form, fields] = useForm({
    lastResult: actionData,
    constraint: getValibotConstraint(onboardingSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: onboardingSchema });
    },
  });
  useEffect(() => {
    const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (fields.timeZone.value == null && timeZones.includes(defaultTimeZone)) {
      form.update({
        name: fields.timeZone.name,
        value: defaultTimeZone,
      });
    }
  }, [timeZones, form, fields]);

  return (
    <Page asChild className="flex flex-col items-center">
      <div>
        <FormProvider context={form.context}>
          <Form
            method="post"
            id={form.id}
            noValidate={form.noValidate}
            aria-labelledby={`${form.id}-title`}
            aria-describedby={form.errors != null ? form.errorId : undefined}
            onSubmit={form.onSubmit}
            className="w-full space-y-xs sm:w-96"
          >
            <PageHeading id={`${form.id}-title`}>Account setup</PageHeading>
            {form.errors != null && (
              <Alert
                variant="destructive"
                id={form.errorId}
                aria-labelledby={`${form.errorId}-heading`}
              >
                <AlertCircle aria-hidden="true" className="size-xs" />
                <AlertTitle id={`${form.errorId}-heading`}>
                  Error setting up account
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
                    onClick={() => timeZoneButtonRef.current?.focus()}
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
                          "w-full justify-between sm:w-96",
                          !control.value && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {control.value ?? "Select time zone"}
                        </span>
                        <ChevronsUpDown
                          aria-hidden="true"
                          className="shrink-0 opacity-50"
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="flex justify-end">
              <Button>Save</Button>
            </p>
          </Form>
        </FormProvider>
      </div>
    </Page>
  );
}

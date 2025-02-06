import { FormProvider, useForm } from "@conform-to/react";
import type { FormMetadata } from "@conform-to/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, useNavigation } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import type * as v from "valibot";
import type { Route } from "./+types/onboarding.route";
import { onboardingSchema } from "./model";
import { getAuthenticatedUser, updateTimeZone } from "./services.server";
import { formAction } from "~/form/action.server";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  getFormProps,
} from "~/form/form";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
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
  form: FormMetadata<v.InferOutput<typeof onboardingSchema>>,
  fields: ReturnType<
    FormMetadata<v.InferOutput<typeof onboardingSchema>>["getFieldset"]
  >,
) {
  useEffect(() => {
    const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!fields.timeZone.value && timeZones.includes(defaultTimeZone)) {
      form.update({
        name: fields.timeZone.name,
        value: defaultTimeZone,
      });
    }
  }, [timeZones, form, fields.timeZone]);
}

export default function OnboardingRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { timeZones } = loaderData;
  const timeZoneButtonRef = useRef<HTMLButtonElement>(null);
  const navigation = useNavigation();
  const [form, fields] = useForm({
    lastResult: actionData,
    constraint: getValibotConstraint(onboardingSchema),
    shouldRevalidate: "onInput",
    defaultNoValidate: false,
    onValidate: ({ formData }) => {
      return parseWithValibot(formData, { schema: onboardingSchema });
    },
  });
  const formErrorRef = useScrollIntoView<HTMLElement>(form.errors);
  useSetTimeZone(timeZones, form, fields);

  return (
    <Page asChild className="px-fl-sm-2xl">
      <div>
        <FormProvider context={form.context}>
          <Form
            {...getFormProps(form)}
            method="post"
            aria-labelledby={`${form.id}-title`}
            className={twJoin(
              "gap-fl-sm flex flex-col",
              navigation.state === "submitting" && "[&_*]:cursor-wait",
            )}
          >
            <PageHeading id={`${form.id}-title`}>Account setup</PageHeading>
            {form.errors != null && (
              <Alert
                variant="destructive"
                id={form.errorId}
                aria-labelledby={`${form.errorId}-heading`}
                ref={formErrorRef}
              >
                <AlertCircle aria-hidden="true" className="size-fl-xs" />
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
              kind="select"
              render={({ field, control }) => (
                <FormItem className="w-full max-w-96 self-center">
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
                  <input
                    type="hidden"
                    name={field.name}
                    value={control.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="flex justify-end">
              <PendingButton
                pending={navigation.state === "submitting"}
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

import { FormProvider, useForm } from "@conform-to/react";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AlertCircle, X } from "lucide-react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { useHydrated } from "remix-utils/use-hydrated";
import { taskSchema } from "./model";
import { createTask, getNewTaskForm } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { FormField, FormItem, FormLabel, FormMessage } from "~/form/field";
import { Input } from "~/form/input";
import { genericError } from "~/form/validation";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";

export function loader() {
  const taskForm = getNewTaskForm();
  return { taskForm };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
  const result = await formAction({
    formData,
    requestHeaders: request.headers,
    schema: taskSchema,
    mutation: async (values) => {
      await createTask(values, user.id);
      return null;
    },
    humanName: "create the to-do",
    hiddenFields: ["id"],
  });
  return result ?? redirect("/home", 303);
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "New task", error }) }];
};

export default function NewTaskRoute() {
  const isHydrated = useHydrated();
  const { taskForm } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    constraint: getValibotConstraint(taskSchema),
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: taskSchema });
    },
    defaultValue: taskForm,
  });
  const formError =
    form.errors?.[0] ??
    (fields.id.errors != null ? genericError("create the to-do") : null);

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
            <PageHeading id={`${form.id}-title`}>New to-do</PageHeading>
            {formError != null && (
              <Alert
                variant="destructive"
                id={form.errorId}
                aria-labelledby={`${form.errorId}-heading`}
              >
                <AlertCircle aria-hidden="true" className="size-xs" />
                <AlertTitle id={`${form.errorId}-heading`}>
                  Error adding to-do
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
            <FormField
              name={fields.deadlineDate.name}
              render={({ field, control }) => (
                <FormItem>
                  <FormLabel>Deadline date</FormLabel>
                  <span className="flex gap-2xs">
                    <Input
                      {...field}
                      value={control.value ?? ""}
                      onChange={control.onChange}
                      type="date"
                      className="flex-1"
                    />
                    {(!isHydrated || control.value != null) && (
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
                    )}
                  </span>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={fields.deadlineTime.name}
              render={({ field, control }) => (
                <FormItem>
                  <FormLabel>Deadline time</FormLabel>
                  <span className="flex gap-2xs">
                    <Input
                      {...field}
                      value={control.value ?? ""}
                      onChange={control.onChange}
                      type="time"
                      className="flex-1"
                    />
                    {(!isHydrated || control.value != null) && (
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
                    )}
                  </span>
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

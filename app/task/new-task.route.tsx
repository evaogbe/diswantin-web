import { useForm } from "@conform-to/react";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { taskSchema } from "./model";
import { createTask, getNewTaskForm } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { genericError } from "~/form/validation";
import { getTitle } from "~/utils/meta";

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
  return result ?? redirect("/home");
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "New task", error }) }];
};

export default function NewTask() {
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
    <Form
      method="post"
      autoComplete="off"
      id={form.id}
      aria-labelledby={`${form.id}-title`}
      aria-describedby={formError != null ? form.errorId : undefined}
      onSubmit={form.onSubmit}
    >
      <h2 id={`${form.id}-title`}>New to-do</h2>
      {formError != null && (
        <section
          id={form.errorId}
          role="alert"
          aria-labelledby={`${form.errorId}-heading`}
        >
          <h3 id={`${form.errorId}-heading`}>Error adding to-do</h3>
          <p>{formError}</p>
        </section>
      )}
      <div hidden>
        <AuthenticityTokenInput />
        <input
          type="hidden"
          name={fields.id.name}
          defaultValue={fields.id.initialValue}
        />
      </div>
      <p>
        <label htmlFor={fields.name.id}>Name</label>
        <input
          id={fields.name.id}
          name={fields.name.name}
          defaultValue={fields.name.initialValue}
          aria-invalid={fields.name.errors != null}
          aria-errormessage={
            fields.name.errors != null ? fields.name.errorId : undefined
          }
          required={fields.name.required}
          maxLength={fields.name.maxLength}
        />
        {fields.name.errors != null && (
          <strong id={fields.name.errorId} role="alert">
            {fields.name.errors[0]}
          </strong>
        )}
      </p>
      <p>
        <button>Save</button>
      </p>
    </Form>
  );
}

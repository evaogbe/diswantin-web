import { useForm } from "@conform-to/react";
import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { taskSchema } from "~/task/model";
import { createTask, getNewTaskForm } from "~/task/services.server";

export function loader() {
  const taskForm = getNewTaskForm();
  return { taskForm };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithValibot(formData, {
    schema: taskSchema,
  });

  if (submission.status !== "success") {
    console.warn("Validation failure for create task", submission.error);
    if (submission.error?.id != null) {
      throw new Response(null, { status: 404 });
    }

    return submission.reply();
  }

  try {
    await createTask(submission.value);
  } catch (e) {
    console.error(e);
    return submission.reply({
      formErrors: [
        "We were unable to create the task due to a technical issue on our end. Try again later. Thank you for your patience.",
      ],
    });
  }

  return redirect("/");
}

export const meta: MetaFunction = () => {
  return [{ title: "New task | Diswantin" }];
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

  return (
    <Form
      method="post"
      autoComplete="off"
      id={form.id}
      aria-labelledby={`${form.id}-title`}
      aria-describedby={form.errors != null ? form.errorId : undefined}
      onSubmit={form.onSubmit}
    >
      <h2 id={`${form.id}-title`}>New to-do</h2>
      {form.errors != null && (
        <section
          id={form.errorId}
          role="alert"
          aria-labelledby={`${form.errorId}-heading`}
        >
          <h3 id={`${form.errorId}-heading`}>Error adding to-do</h3>
          <p>{form.errors[0]}</p>
        </section>
      )}
      <div hidden>
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

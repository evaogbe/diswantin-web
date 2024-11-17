import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { createTask, getNewTaskForm } from "~/task/services.server";

export function loader() {
  const taskForm = getNewTaskForm();
  return { taskForm };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await createTask({
    id: String(formData.get("id")),
    name: String(formData.get("name")).trim(),
  });
  return redirect("/");
}

export const meta: MetaFunction = () => {
  return [{ title: "New task | Diswantin" }];
};

export default function NewTask() {
  const { taskForm } = useLoaderData<typeof loader>();
  return (
    <Form method="post" autoComplete="off" aria-labelledby="to-do-form-heading">
      <h2 id="to-do-form-heading">New to-do</h2>
      <div hidden>
        <input type="hidden" name="id" value={taskForm.id} />
      </div>
      <p>
        <label htmlFor="to-do-form-name">Name</label>
        <input name="name" id="to-do-form-name" />
      </p>
      <p>
        <button>Save</button>
      </p>
    </Form>
  );
}

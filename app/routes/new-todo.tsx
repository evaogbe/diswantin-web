import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { createTask } from "~/task/services.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await createTask(String(formData.get("name")));
  return redirect("/");
}

export const meta: MetaFunction = () => {
  return [{ title: "New task | Diswantin" }];
};

export default function NewTask() {
  return (
    <Form method="post" autoComplete="off" aria-labelledby="to-do-form-heading">
      <h2 id="to-do-form-heading">New to-do</h2>
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

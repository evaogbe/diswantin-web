import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { taskSchema } from "./model";
import { createTask, getNewTaskForm } from "./services.server";
import { TaskForm } from "./task-form";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  await getAuthenticatedUser(request);
  const url = new URL(request.url);
  const taskForm = getNewTaskForm(url.searchParams.get("name"));
  return { taskForm };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
  return formAction({
    formData,
    requestHeaders: request.headers,
    schema: taskSchema,
    mutation: async (values) => {
      await createTask(values, user.id);
      return ["success", "/home"];
    },
    humanName: "create the to-do",
    hiddenFields: ["id"],
  });
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "New to-do", error }) }];
};

export default function NewTaskRoute() {
  const { taskForm } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  return (
    <TaskForm
      taskForm={taskForm}
      lastResult={lastResult}
      humanName="create the to-do"
      title="New to-do"
      errorHeading="Error adding to-do"
    />
  );
}

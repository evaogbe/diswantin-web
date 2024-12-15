import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import * as v from "valibot";
import { taskSchema } from "./model";
import { getEditTaskForm, updateTask } from "./services.server";
import { TaskForm } from "./task-form";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";

const paramsSchema = v.object({
  id: v.string(),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  const { id } = v.parse(paramsSchema, params);
  const taskForm = await getEditTaskForm(id, user.id);
  if (taskForm == null) {
    throw new Response(null, { status: 404 });
  }

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
      await updateTask(values, user.id);
      return ["success", `/todo/${values.id}`];
    },
    humanName: "edit the to-do",
    hiddenFields: ["id"],
  });
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "Edit to-do", error }) }];
};

export default function EditTaskRoute() {
  const { taskForm } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

  return (
    <TaskForm
      taskForm={taskForm}
      lastResult={lastResult}
      humanName="edit the to-do"
      title="Edit to-do"
      errorHeading="Error editing to-do"
    />
  );
}

import type { Route } from "./+types/new-task.route";
import { taskSchema } from "./model";
import { createTask, getNewTaskForm } from "./services.server";
import { TaskForm } from "./task-form";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";

export async function loader({ request }: Route.LoaderArgs) {
  await getAuthenticatedUser(request);
  const url = new URL(request.url);
  const taskForm = getNewTaskForm(url.searchParams.get("name"));
  return { taskForm };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
  return formAction({
    formData,
    requestHeaders: request.headers,
    schema: taskSchema,
    mutation: async (values) => {
      await createTask(values, user.id);
      return { status: "success", path: "/home" };
    },
    humanName: "create the to-do",
    hiddenFields: ["id"],
  });
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "New to-do", error }) }];
}

export default function NewTaskRoute({ loaderData }: Route.ComponentProps) {
  const { taskForm } = loaderData;

  return (
    <TaskForm
      taskForm={taskForm}
      humanName="create the to-do"
      title="New to-do"
      errorHeading="Error adding to-do"
    />
  );
}

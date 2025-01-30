import { INTENT } from "@conform-to/dom";
import { parseWithValibot } from "conform-to-valibot";
import { data } from "react-router";
import * as v from "valibot";
import type { Route } from "./+types/edit-task.route";
import { recurrenceFormSchema, taskSchema } from "./model";
import { getEditTaskForm, updateTask } from "./services.server";
import { TaskForm } from "./task-form";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";

const paramsSchema = v.object({
  id: v.string(),
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthenticatedUser(request);
  const { id } = v.parse(paramsSchema, params);
  const taskForm = await getEditTaskForm(id, user);
  if (taskForm == null) {
    throw data(null, { status: 404 });
  }

  return { taskForm, timeZone: user.timeZone };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();

  if (formData.has(INTENT)) {
    const submission = parseWithValibot(formData, {
      schema: (intent) =>
        [
          "taskId",
          "start",
          "step.type",
          "step.value",
          "weekdays",
          "monthType",
        ].includes(intent?.payload.name ?? "")
          ? recurrenceFormSchema
          : taskSchema,
    });
    return submission.reply();
  }

  switch (formData.get("intent")) {
    case "save-recurrence": {
      return formAction({
        formData,
        requestHeaders: request.headers,
        schema: recurrenceFormSchema,
        mutation: () => Promise.resolve({ status: "success" }),
        humanName: "set the to-do repetition",
        hiddenFields: ["taskId"],
      });
    }
    case "save-task": {
      return formAction({
        formData,
        requestHeaders: request.headers,
        schema: taskSchema,
        mutation: async (values) => {
          await updateTask(values, user);
          return {
            status: "success",
            path: `/todo/${values.id}`,
          };
        },
        humanName: "edit the to-do",
        hiddenFields: ["id"],
      });
    }
    default: {
      throw data(null, { status: 400 });
    }
  }
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Edit to-do", error }) }];
}

export default function EditTaskRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { taskForm, timeZone } = loaderData;

  return (
    <TaskForm
      initialValues={taskForm}
      lastResult={actionData}
      timeZone={timeZone}
      humanName="edit the to-do"
      title="Edit to-do"
      errorHeading="Error editing to-do"
    />
  );
}

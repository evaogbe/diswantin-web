import { INTENT } from "@conform-to/dom";
import { parseWithValibot } from "conform-to-valibot";
import { data } from "react-router";
import * as v from "valibot";
import type { Route } from "./+types/edit-task.route";
import { partialTaskSchema, recurrenceFormSchema, taskSchema } from "./model";
import {
  deleteTaskParent,
  getEditTaskForm,
  savePartialTask,
  updateTask,
} from "./services.server";
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
  const [taskForm, cookie] = await getEditTaskForm(id, user, request);
  if (taskForm == null) {
    throw data(null, { status: 404, headers: { "Set-Cookie": cookie } });
  }

  return data(
    { taskForm, timeZone: user.timeZone },
    { headers: { "Set-Cookie": cookie } },
  );
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();

  const intent = formData.get(INTENT);
  if (typeof intent === "string") {
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
    const clearParent = v.is(
      v.object({
        type: v.literal("update"),
        payload: v.object({ name: v.literal("parent"), value: v.literal("") }),
      }),
      JSON.parse(intent),
    );
    return data(
      submission.reply(),
      clearParent
        ? { headers: { "Set-Cookie": await deleteTaskParent() } }
        : undefined,
    );
  }

  switch (formData.get("intent")) {
    case "select-parent-task": {
      return formAction({
        formData,
        requestHeaders: request.headers,
        schema: partialTaskSchema,
        mutation: async (values) => {
          return {
            status: "success",
            path: `/todo-form/${values.id}/previous`,
            init: { headers: { "Set-Cookie": await savePartialTask(values) } },
          };
        },
        humanName: "select the previous to-do",
        hiddenFields: ["id"],
      });
    }
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
        hiddenFields: ["id", "parent"],
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

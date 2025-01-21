import Check from "@material-design-icons/svg/filled/check.svg?react";
import RemoveDone from "@material-design-icons/svg/filled/remove_done.svg?react";
import { AlertCircle, EllipsisVertical, Pencil, Trash } from "lucide-react";
import { data, Form, Link, useFetcher, useNavigation } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import * as v from "valibot";
import type { Route } from "./+types/task-detail.route";
import { deleteTaskSchema, markDoneSchema, unmarkDoneSchema } from "./model";
import {
  deleteTask,
  getTaskDetail,
  markTaskDone,
  unmarkTaskDone,
} from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { useFormError } from "~/form/form-error";
import { useIntents } from "~/form/intents";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { cn } from "~/ui/classes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";
import { useScrollIntoView } from "~/ui/scroll-into-view";

const paramsSchema = v.object({
  id: v.string(),
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthenticatedUser(request);
  const { id } = v.parse(paramsSchema, params);
  const task = await getTaskDetail(id, user);
  if (task == null) {
    throw data(null, { status: 404 });
  }

  return { task };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "mark-done": {
      const user = await getAuthenticatedUser(request);
      return formAction({
        formData,
        requestHeaders: request.headers,
        schema: markDoneSchema,
        mutation: async (values) => {
          await markTaskDone(values.id, user.id);
          return { status: "success" };
        },
        humanName: "mark the to-do done",
        hiddenFields: ["id"],
      });
    }
    case "unmark-done": {
      const user = await getAuthenticatedUser(request);
      return formAction({
        formData,
        requestHeaders: request.headers,
        schema: unmarkDoneSchema,
        mutation: async (values) => {
          await unmarkTaskDone(values.id, user.id);
          return { status: "success" };
        },
        humanName: "unmark the to-do done",
        hiddenFields: ["id"],
      });
    }
    case "delete": {
      const user = await getAuthenticatedUser(request);
      return formAction({
        formData,
        requestHeaders: request.headers,
        schema: deleteTaskSchema,
        mutation: async (values) => {
          await deleteTask(values.id, user.id);
          return { status: "success", path: "/home" };
        },
        humanName: "delete the to-do",
        hiddenFields: ["id"],
      });
    }
    default: {
      throw data(null, { status: 400 });
    }
  }
}

export function meta({ data, error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: data.task.name, error }) }];
}

const errorHeadings = new Map([
  ["mark-done", "Error marking to-do done"],
  ["unmark-done", "Error unmarking to-do done"],
  ["delete", "Error deleting to-do"],
]);

export default function TaskDetailRoute({ loaderData }: Route.ComponentProps) {
  const { task } = loaderData;
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const lastIntent = useIntents(fetcher);
  const formError = useFormError(
    lastIntent === "mark-done" || lastIntent === "unmark-done"
      ? fetcher
      : undefined,
  );
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);
  const isDone =
    fetcher.formData == null
      ? task.isDone
      : fetcher.formData.get("intent") === "mark-done";

  return (
    <Page
      aria-labelledby="task-detail-heading"
      className={cn(
        "space-y-sm transition-opacity",
        navigation.state === "submitting" && "opacity-0",
      )}
    >
      <header className="space-y-xs">
        <PageHeading
          id="task-detail-heading"
          className={cn(isDone && "line-through")}
        >
          {task.name}
          {isDone && <span className="sr-only">Done</span>}
        </PageHeading>
        {formError != null && (
          <Alert
            variant="destructive"
            id="form-error"
            aria-labelledby="form-error-heading"
            ref={formErrorRef}
          >
            <AlertCircle aria-hidden="true" className="size-xs" />
            <AlertTitle id="form-error-heading">
              {errorHeadings.get(lastIntent ?? "") ?? "Unexpected error"}
            </AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end gap-2xs">
          <fetcher.Form
            method="post"
            aria-describedby={
              formError != null &&
              (lastIntent === "mark-done" || lastIntent === "unmark-done")
                ? "form-error"
                : undefined
            }
          >
            <div hidden>
              <AuthenticityTokenInput />
              <input type="hidden" name="id" defaultValue={task.id} />
            </div>
            <p>
              {isDone ? (
                <Button name="intent" value="unmark-done" variant="outline">
                  <RemoveDone aria-hidden="true" />
                  <span className="max-sm:sr-only">Unmark done</span>
                </Button>
              ) : (
                <Button name="intent" value="mark-done" variant="outline">
                  <Check aria-hidden="true" />
                  <span className="max-sm:sr-only">Mark done</span>
                </Button>
              )}
            </p>
          </fetcher.Form>
          <Button variant="outline" asChild>
            <Link to={`/edit-todo/${task.id}`}>
              <Pencil aria-hidden="true" />
              <span className="max-sm:sr-only">Edit</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <EllipsisVertical aria-hidden="true" />
                <span className="max-sm:sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Form
                  method="post"
                  aria-describedby={
                    formError != null && lastIntent === "delete"
                      ? "form-error"
                      : undefined
                  }
                >
                  <div hidden>
                    <AuthenticityTokenInput />
                    <input type="hidden" name="id" defaultValue={task.id} />
                  </div>
                  <p>
                    <button
                      name="intent"
                      value="delete"
                      className="inline-flex items-center gap-2xs"
                    >
                      <Trash aria-hidden="true" className="size-xs" />
                      Delete
                    </button>
                  </p>
                </Form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {navigation.state === "submitting" && (
        <p role="status" className="sr-only">
          Deleting…
        </p>
      )}
      {task.note != null && <p className="whitespace-pre-wrap">{task.note}</p>}
      <dl>
        {task.deadline != null && (
          <>
            <dt className="text-muted-foreground [&:not(:first-child)]:mt-2xs">
              Deadline
            </dt>
            <dd>
              <time dateTime={task.deadline.iso}>{task.deadline.human}</time>
            </dd>
          </>
        )}
        {task.startAfter != null && (
          <>
            <dt className="text-muted-foreground [&:not(:first-child)]:mt-2xs">
              Start after
            </dt>
            <dd>
              <time dateTime={task.startAfter.iso}>
                {task.startAfter.human}
              </time>
            </dd>
          </>
        )}
        {task.scheduledAt != null && (
          <>
            <dt className="text-muted-foreground [&:not(:first-child)]:mt-2xs">
              Scheduled at
            </dt>
            <dd>
              <time dateTime={task.scheduledAt.iso}>
                {task.scheduledAt.human}
              </time>
            </dd>
          </>
        )}
      </dl>
    </Page>
  );
}

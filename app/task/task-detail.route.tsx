import Check from "@material-design-icons/svg/filled/check.svg?react";
import RemoveDone from "@material-design-icons/svg/filled/remove_done.svg?react";
import { AlertCircle, EllipsisVertical, Pencil, Trash } from "lucide-react";
import { data, Form, Link, useFetcher, useNavigation } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
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
import { useIntents } from "~/form/intents";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
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
          await markTaskDone(values.id, user);
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
          await unmarkTaskDone(values.id, user);
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

export default function TaskDetailRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { task } = loaderData;
  const navigation = useNavigation();
  const fetcher = useFetcher<typeof action>();
  const lastIntent = useIntents(fetcher);
  const formError =
    lastIntent === "mark-done" || lastIntent === "unmark-done"
      ? Object.values(fetcher.data?.error ?? {})[0]?.[0]
      : Object.values(actionData?.error ?? {})[0]?.[0];
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);
  const isDone =
    fetcher.formData == null
      ? task.isDone
      : fetcher.formData.get("intent") === "mark-done";

  return (
    <Page
      aria-labelledby="task-detail-heading"
      className={twJoin(
        "space-y-fl-sm transition-opacity",
        navigation.state === "submitting" && "opacity-0",
      )}
    >
      <header className="space-y-fl-xs">
        <PageHeading
          id="task-detail-heading"
          className={twJoin(isDone && "line-through")}
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
            <AlertCircle aria-hidden="true" className="size-fl-xs" />
            <AlertTitle id="form-error-heading">
              {errorHeadings.get(lastIntent ?? "") ?? "Unexpected error"}
            </AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div className="gap-fl-2xs flex justify-end">
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
                      className="gap-fl-2xs inline-flex items-center"
                    >
                      <Trash aria-hidden="true" className="size-fl-xs" />
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
        {task.recurrence != null && (
          <>
            <dt className="text-muted-foreground not-first:mt-fl-2xs">
              Repeats
            </dt>
            <dd>{task.recurrence}</dd>
          </>
        )}
        {task.deadline != null && (
          <>
            <dt className="text-muted-foreground not-first:mt-fl-2xs">
              Deadline
            </dt>
            <dd>
              <time dateTime={task.deadline.iso}>{task.deadline.human}</time>
            </dd>
          </>
        )}
        {task.startAfter != null && (
          <>
            <dt className="text-muted-foreground not-first:mt-fl-2xs">
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
            <dt className="text-muted-foreground not-first:mt-fl-2xs">
              Scheduled at
            </dt>
            <dd>
              <time dateTime={task.scheduledAt.iso}>
                {task.scheduledAt.human}
              </time>
            </dd>
          </>
        )}
        {task.parent != null && (
          <>
            <dt className="text-muted-foreground not-first:mt-fl-2xs">
              Previous to-do
            </dt>
            <dd>
              <p className={twJoin(task.parent.isDone && "line-through")}>
                {task.parent.name}
                {task.parent.isDone && <span className="sr-only">Done</span>}
              </p>
              <p>
                <Button variant="link" size="sm" asChild>
                  <Link to={`/todo/${task.parent.id}`}>View parent</Link>
                </Button>
              </p>
            </dd>
          </>
        )}
        {task.children.length > 0 && (
          <>
            <dt className="text-muted-foreground not-first:mt-fl-2xs">
              Next to-dos
            </dt>
            <dd>
              <ul>
                {task.children.map((child) => (
                  <li key={child.id} className="border-b">
                    <Link
                      to={`/todo/${child.id}`}
                      className={twJoin(
                        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground px-fl-2xs py-fl-3xs flex w-full min-w-fit rounded-sm transition-colors focus:outline-hidden",
                        child.isDone && "line-through",
                      )}
                    >
                      {child.name}
                      {child.isDone && <span className="sr-only">Done</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
    </Page>
  );
}

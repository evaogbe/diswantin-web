import type { SubmissionResult } from "@conform-to/react";
import Check from "@material-design-icons/svg/filled/check.svg?react";
import RemoveDone from "@material-design-icons/svg/filled/remove_done.svg?react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { Fetcher } from "@remix-run/react";
import { AlertCircle, EllipsisVertical, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import * as v from "valibot";
import { deleteTaskSchema, markDoneSchema, unmarkDoneSchema } from "./model";
import {
  deleteTask,
  getTaskDetail,
  markTaskDone,
  unmarkTaskDone,
} from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
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

const paramsSchema = v.object({
  id: v.string(),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  const { id } = v.parse(paramsSchema, params);
  const task = await getTaskDetail(id, user);
  if (task == null) {
    throw new Response(null, { status: 404 });
  }

  return { task };
}

export async function action({ request }: ActionFunctionArgs) {
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
          return null;
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
          return null;
        },
        humanName: "unmark the to-do done",
        hiddenFields: ["id"],
      });
    }
    case "delete": {
      const user = await getAuthenticatedUser(request);
      const result = await formAction({
        formData,
        requestHeaders: request.headers,
        schema: deleteTaskSchema,
        mutation: async (values) => {
          await deleteTask(values.id, user.id);
          return null;
        },
        humanName: "delete the to-do",
        hiddenFields: ["id"],
      });
      return result ?? redirect("/home");
    }
    default: {
      throw new Response(null, { status: 400 });
    }
  }
}

export const meta: MetaFunction<typeof loader> = ({ data, error }) => {
  return [
    { title: getTitle({ page: data?.task.name ?? "To-do Detail", error }) },
  ];
};

const errorHeadings = {
  "mark-done": "Error marking to-do done",
  "unmark-done": "Error unmarking to-do done",
  delete: "Error deleting to-do",
};

function useFormError(
  fetcher: Fetcher<SubmissionResult | null>,
  fetcherIntents: string[],
) {
  const lastResult = useActionData<SubmissionResult | null>();
  const navigation = useNavigation();
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  useEffect(() => {
    if (navigation.state === "submitting") {
      setLastIntent(
        (navigation.formData?.get("intent") ?? null) as string | null,
      );
      setFormError(null);
    } else if (fetcher.state === "submitting") {
      setLastIntent((fetcher.formData?.get("intent") ?? null) as string | null);
      setFormError(null);
    } else if (
      navigation.state === "idle" &&
      fetcher.state === "idle" &&
      lastIntent != null
    ) {
      if (fetcherIntents.includes(lastIntent)) {
        setFormError(Object.values(fetcher.data?.error ?? {})[0]?.[0] ?? null);
      } else {
        setFormError(Object.values(lastResult?.error ?? {})[0]?.[0] ?? null);
      }
    }
  }, [fetcherIntents, lastResult, navigation, fetcher, lastIntent]);
  return [lastIntent, formError] as const;
}

export default function TaskDetailRoute() {
  const { task } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [lastIntent, formError] = useFormError(fetcher, [
    "mark-done",
    "unmark-done",
  ]);
  const isDone =
    fetcher.formData == null
      ? task.isDone
      : fetcher.formData.get("intent") === "mark-done";

  return (
    <Page aria-labelledby="todo-detail-heading">
      <header className="space-y-xs">
        <PageHeading
          id="todo-detail-heading"
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
          >
            <AlertCircle aria-hidden="true" className="size-xs" />
            <AlertTitle id="form-error-heading">
              {lastIntent != null && lastIntent in errorHeadings
                ? errorHeadings[lastIntent as keyof typeof errorHeadings]
                : "Unexpected error"}
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
                  <RemoveDone aria-hidden="true" className="fill-current" />
                  Unmark done
                </Button>
              ) : (
                <Button name="intent" value="mark-done" variant="outline">
                  <Check aria-hidden="true" className="fill-current" />
                  Mark done
                </Button>
              )}
            </p>
          </fetcher.Form>
          <ClientOnly
            fallback={
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
                  <Button name="intent" value="delete" variant="outline">
                    <Trash aria-hidden="true" /> Delete
                  </Button>
                </p>
              </Form>
            }
          >
            {() => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <EllipsisVertical aria-hidden="true" /> More
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
            )}
          </ClientOnly>
        </div>
      </header>
      <dl className="mt-sm">
        {task.deadline != null && (
          <>
            <dt className="text-muted-foreground">Deadline</dt>
            <dd>{task.deadline}</dd>
          </>
        )}
        {task.scheduledAt != null && (
          <>
            <dt className="text-muted-foreground">Scheduled at</dt>
            <dd>{task.scheduledAt}</dd>
          </>
        )}
      </dl>
    </Page>
  );
}

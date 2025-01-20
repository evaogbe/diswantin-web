import AddTask from "@material-design-icons/svg/filled/add_task.svg?react";
import Check from "@material-design-icons/svg/filled/check.svg?react";
import Details from "@material-design-icons/svg/filled/details.svg?react";
import { AlertCircle, Plus } from "lucide-react";
import { Link, useFetcher } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import type { Route } from "./+types/current-task.route";
import { markDoneSchema } from "./model";
import { getCurrentTask, markTaskDone } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { useFormError } from "~/form/form-error";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";
import { cn } from "~/ui/classes";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthenticatedUser(request);
  const currentTask = await getCurrentTask(user);
  return { currentTask };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
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

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ error }) }];
}

export default function CurrentTaskRoute({ loaderData }: Route.ComponentProps) {
  const { currentTask } = loaderData;
  const fetcher = useFetcher();
  const markDoneFormErrors = useFormError(fetcher);

  if (currentTask == null) {
    return (
      <Page
        aria-labelledby="current-task-heading"
        className="flex flex-col items-center"
      >
        <PageHeading id="current-task-heading">Current to-do</PageHeading>
        <AddTask
          aria-hidden="true"
          className="mt-xs size-2xl text-muted-foreground"
        />
        <p className="mt-sm text-xl text-muted-foreground">
          No upcoming to-dos
        </p>
        <p className="mt-sm">
          <Button asChild>
            <Link to="/new-todo">
              <Plus aria-hidden="true" /> Add to-do
            </Link>
          </Button>
        </p>
      </Page>
    );
  }

  return (
    <Page
      aria-labelledby="current-task-heading"
      className="flex flex-col items-center"
    >
      <PageHeading id="current-task-heading">Current to-do</PageHeading>
      {markDoneFormErrors != null && (
        <Alert
          variant="destructive"
          id="mark-done-form-error"
          aria-labelledby="mark-done-form-error-heading"
          className="mt-xs"
        >
          <AlertCircle aria-hidden="true" className="size-xs" />
          <AlertTitle id="mark-done-form-error-heading">
            Error marking to-do done
          </AlertTitle>
          <AlertDescription>{markDoneFormErrors}</AlertDescription>
        </Alert>
      )}
      <div
        className={cn(
          "w-full transition-opacity",
          fetcher.state === "submitting" && "opacity-0",
        )}
      >
        {fetcher.state === "submitting" && (
          <p role="status" className="sr-only">
            Marking done…
          </p>
        )}
        <p className="mt-2xs text-center text-2xl tracking-tight">
          {currentTask.name}
        </p>
        {currentTask.note != null && (
          <p className="mt-sm whitespace-pre-wrap text-center text-lg text-muted-foreground">
            {currentTask.note}
          </p>
        )}
        <footer className="mt-md flex justify-around">
          <p>
            <Button asChild variant="outline">
              <Link to={`/todo/${currentTask.id}`}>
                <Details aria-hidden="true" /> Details
              </Link>
            </Button>
          </p>
          <fetcher.Form
            method="post"
            aria-describedby={
              markDoneFormErrors != null ? "mark-done-form-error" : undefined
            }
          >
            <div hidden>
              <AuthenticityTokenInput />
              <input type="hidden" name="id" value={currentTask.id} />
            </div>
            <p>
              <Button variant="secondary">
                <Check aria-hidden="true" /> Done
              </Button>
            </p>
          </fetcher.Form>
        </footer>
      </div>
    </Page>
  );
}

import AddTask from "@material-design-icons/svg/filled/add_task.svg?react";
import Check from "@material-design-icons/svg/filled/check.svg?react";
import { AlertCircle, Microscope, Plus } from "lucide-react";
import { useEffect } from "react";
import { Link, useFetcher, useLocation } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import type { Route } from "./+types/current-task.route";
import { markDoneSchema } from "./model";
import { getCurrentTask, markTaskDone } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { useScrollIntoView } from "~/ui/scroll-into-view";

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
      await markTaskDone(values.id, user);
      return { status: "success" };
    },
    humanName: "mark the to-do done",
    hiddenFields: ["id"],
  });
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ error }) }];
}

function useReloadInterval(delayMs = 1000 * 60 * 60) {
  const location = useLocation();
  const currentTaskFetcher = useFetcher<typeof loader>();
  useEffect(() => {
    const id = setInterval(() => {
      void currentTaskFetcher.load(`${location.pathname}?${location.search}`);
    }, delayMs);
    return () => {
      clearInterval(id);
    };
  }, [delayMs, location, currentTaskFetcher]);
  return currentTaskFetcher.data;
}

export default function CurrentTaskRoute({ loaderData }: Route.ComponentProps) {
  const currentTaskFetcherData = useReloadInterval();
  const { currentTask } = currentTaskFetcherData ?? loaderData;
  const markDoneFetcher = useFetcher<typeof action>();
  const markDoneFormError = Object.values(
    markDoneFetcher.data?.error ?? {},
  )[0]?.[0];
  const formErrorRef = useScrollIntoView<HTMLElement>(markDoneFormError);

  if (currentTask == null) {
    return (
      <Page
        aria-labelledby="current-task-heading"
        className="flex flex-col items-center"
      >
        <PageHeading id="current-task-heading" className="text-center">
          Current to-do
        </PageHeading>
        <AddTask
          aria-hidden="true"
          className="mt-fl-xs size-fl-2xl text-muted-foreground"
        />
        <p className="mt-fl-sm text-muted-foreground text-center text-xl">
          No upcoming to-dos
        </p>
        <p className="mt-fl-sm">
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
      <PageHeading id="current-task-heading" className="text-center">
        Current to-do
      </PageHeading>
      <div
        className={twJoin(
          "w-full transition-opacity",
          markDoneFetcher.state === "submitting" && "opacity-0",
        )}
      >
        {markDoneFetcher.state === "submitting" && (
          <p role="status" className="sr-only">
            Marking done…
          </p>
        )}
        {markDoneFormError != null && (
          <Alert
            variant="destructive"
            id="mark-done-form-error"
            aria-labelledby="mark-done-form-error-heading"
            ref={formErrorRef}
            className="mt-fl-sm"
          >
            <AlertCircle aria-hidden="true" className="size-fl-xs" />
            <AlertTitle id="mark-done-form-error-heading">
              Error marking to-do done
            </AlertTitle>
            <AlertDescription>{markDoneFormError}</AlertDescription>
          </Alert>
        )}
        <p className="mt-fl-xs text-center text-2xl tracking-tight">
          {currentTask.name}
        </p>
        {currentTask.note != null && (
          <p className="mt-fl-sm text-muted-foreground text-center text-lg whitespace-pre-wrap">
            {currentTask.note}
          </p>
        )}
        <footer className="mt-fl-md gap-fl-3xs flex justify-around">
          <p>
            <Button asChild variant="outline">
              <Link to={`/todo/${currentTask.id}`}>
                <Microscope aria-hidden="true" /> Details
              </Link>
            </Button>
          </p>
          <markDoneFetcher.Form
            method="post"
            aria-describedby={
              markDoneFormError != null ? "mark-done-form-error" : undefined
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
          </markDoneFetcher.Form>
        </footer>
      </div>
    </Page>
  );
}

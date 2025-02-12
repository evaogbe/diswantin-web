import AddTask from "@material-design-icons/svg/filled/add_task.svg?react";
import Check from "@material-design-icons/svg/filled/check.svg?react";
import { AlertCircle, Microscope, Plus, SkipForward } from "lucide-react";
import { useEffect } from "react";
import { data, Link, useFetcher, useLocation } from "react-router";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import type { Route } from "./+types/current-task.route";
import { markDoneSchema, skipTaskSchema } from "./model";
import { getCurrentTask, markTaskDone, skipTask } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { useIntents } from "~/form/intents";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Button } from "~/ui/button";
import { useScrollIntoView } from "~/ui/scroll-into-view";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/ui/sheet";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthenticatedUser(request);
  const currentTask = await getCurrentTask(user);
  return { currentTask };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "mark-done": {
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
    case "skip": {
      return formAction({
        formData,
        requestHeaders: request.headers,
        schema: skipTaskSchema,
        mutation: async (values) => {
          await skipTask(values.id, user);
          return { status: "success" };
        },
        humanName: "skip the to-do",
        hiddenFields: ["id"],
      });
    }
    default: {
      throw data(null, { status: 400 });
    }
  }
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
  const skipTaskFetcher = useFetcher<typeof action>();
  const lastIntent = useIntents(markDoneFetcher, skipTaskFetcher);
  const formError = Object.values(
    (lastIntent === "mark-done"
      ? markDoneFetcher.data?.error
      : lastIntent === "skip"
        ? skipTaskFetcher.data?.error
        : {}) ?? {},
  )[0]?.[0];
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);

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
      <header className="space-y-fl-xs w-full">
        <PageHeading id="current-task-heading" className="text-center">
          Current to-do
        </PageHeading>
        <div
          className={twJoin(
            "space-y-fl-xs w-full transition-opacity",
            (markDoneFetcher.state === "submitting" ||
              skipTaskFetcher.state === "submitting") &&
              "opacity-0",
          )}
        >
          {formError != null && (
            <Alert
              variant="destructive"
              id="form-error"
              aria-labelledby="form-error-heading"
              ref={formErrorRef}
            >
              <AlertCircle aria-hidden="true" className="size-fl-xs" />
              <AlertTitle id="form-error-heading">
                {lastIntent === "mark-done"
                  ? "Error marking to-do done"
                  : "Error skipping to-do"}
              </AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {currentTask.isRecurring && (
            <Sheet>
              <div className="flex justify-end">
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <SkipForward aria-hidden="true" /> Skip
                  </Button>
                </SheetTrigger>
              </div>
              <SheetContent className="overflow-auto">
                <SheetHeader>
                  <SheetTitle>Skip reason</SheetTitle>
                  <SheetDescription>
                    Does it feel like this to-do is too hard or is there some
                    other reason that it can&apos;t be done today (e.g. not
                    occurring this time, conflicts with another to-do, too late
                    to do it)?
                  </SheetDescription>
                </SheetHeader>
                <SheetFooter className="mt-fl-sm gap-fl-2xs flex-col">
                  <Button variant="outline" asChild>
                    <Link to="/advice">Too hard</Link>
                  </Button>
                  <skipTaskFetcher.Form
                    method="post"
                    aria-describedby={
                      formError != null && lastIntent === "skip"
                        ? "form-error"
                        : undefined
                    }
                  >
                    <div hidden>
                      <AuthenticityTokenInput />
                      <input type="hidden" name="id" value={currentTask.id} />
                    </div>
                    <p>
                      <SheetClose asChild>
                        <Button
                          variant="secondary"
                          name="intent"
                          value="skip"
                          type="submit"
                          className="w-full"
                        >
                          Other
                        </Button>
                      </SheetClose>
                    </p>
                  </skipTaskFetcher.Form>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>
      <div
        className={twJoin(
          "w-full transition-opacity",
          (markDoneFetcher.state === "submitting" ||
            skipTaskFetcher.state === "submitting") &&
            "opacity-0",
        )}
      >
        {skipTaskFetcher.state === "submitting" && (
          <p role="status" className="sr-only">
            Skipping…
          </p>
        )}
        {markDoneFetcher.state === "submitting" && (
          <p role="status" className="sr-only">
            Marking done…
          </p>
        )}
        <p className="mt-fl-2xs text-center text-2xl tracking-tight">
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
              formError != null && lastIntent === "mark-done"
                ? "form-error"
                : undefined
            }
          >
            <div hidden>
              <AuthenticityTokenInput />
              <input type="hidden" name="id" value={currentTask.id} />
            </div>
            <p>
              <Button variant="secondary" name="intent" value="mark-done">
                <Check aria-hidden="true" /> Done
              </Button>
            </p>
          </markDoneFetcher.Form>
        </footer>
      </div>
    </Page>
  );
}

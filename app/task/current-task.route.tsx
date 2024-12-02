import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { AlertCircle, Check, Plus } from "lucide-react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { markDoneSchema } from "./model";
import { getCurrentTask, markTaskDone } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";
import { AddTask } from "~/ui/icons";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  const currentTask = await getCurrentTask(user.id);
  return { currentTask };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
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

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ error }) }];
};

export default function CurrentTaskRoute() {
  const { currentTask } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const markDoneFormErrors = fetcher.data?.error;

  if (currentTask == null) {
    return (
      <Page
        aria-labelledby="current-todo-heading"
        className="flex flex-col items-center"
      >
        <PageHeading id="current-todo-heading">Current to-do</PageHeading>
        <AddTask
          aria-hidden="true"
          className="mt-xs size-2xl fill-muted-foreground"
        />
        <p className="mt-sm text-xl text-muted-foreground">
          No upcoming to-dos
        </p>
        <p className="mt-sm">
          <Button asChild>
            <Link to="/new-todo">
              <Plus aria-hidden="true" />
              Add to-do
            </Link>
          </Button>
        </p>
      </Page>
    );
  }

  return (
    <Page
      aria-labelledby="current-todo-heading"
      className="flex flex-col items-center"
    >
      <PageHeading id="current-todo-heading" className="mb-xs">
        Current to-do
      </PageHeading>
      {markDoneFormErrors != null && (
        <Alert
          variant="destructive"
          id="mark-done-form-error"
          aria-labelledby="mark-done-form-error-heading"
        >
          <AlertCircle aria-hidden="true" className="size-xs" />
          <AlertTitle id="mark-done-form-error-heading">
            Error marking to-do done
          </AlertTitle>
          <AlertDescription>
            {Object.values(markDoneFormErrors)[0]?.[0]}
          </AlertDescription>
        </Alert>
      )}
      <p className="text-2xl tracking-tight">{currentTask.name}</p>
      <fetcher.Form
        method="post"
        aria-describedby={
          markDoneFormErrors != null ? "mark-done-form-error" : undefined
        }
        className="mt-sm"
      >
        <div hidden>
          <AuthenticityTokenInput />
          <input type="hidden" name="id" value={currentTask.id} />
        </div>
        <p>
          <Button variant="secondary">
            <Check aria-hidden="true" />
            Done
          </Button>
        </p>
      </fetcher.Form>
    </Page>
  );
}

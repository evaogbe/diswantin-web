import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { markDoneSchema } from "./model";
import { getCurrentTask, markTaskDone } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/head/meta";

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

export default function CurrentTask() {
  const { currentTask } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const lastResult = fetcher.data;
  return (
    <article aria-labelledby="current-todo-heading">
      <h2 id="current-todo-heading">Current to-do</h2>
      {lastResult?.error != null && (
        <section
          id="mark-done-form-error"
          role="alert"
          aria-labelledby="mark-done-form-error-heading"
        >
          <h3 id="mark-done-form-error-heading">Error marking to-do done</h3>
          <p>{Object.values(lastResult.error)[0]?.[0]}</p>
        </section>
      )}
      {currentTask != null ? (
        <>
          <p>{currentTask.name}</p>
          <fetcher.Form
            method="post"
            aria-describedby={
              lastResult?.error != null ? "mark-done-form-error" : undefined
            }
          >
            <div hidden>
              <AuthenticityTokenInput />
              <input type="hidden" name="id" value={currentTask.id} />
            </div>
            <p>
              <button>Done</button>
            </p>
          </fetcher.Form>
        </>
      ) : (
        <p>No upcoming to-dos</p>
      )}
    </article>
  );
}

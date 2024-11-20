import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { formAction } from "~/form/action.server";
import { markDoneSchema } from "~/task/model";
import { getCurrentTask, markTaskDone } from "~/task/services.server";

export async function loader() {
  const currentTask = await getCurrentTask();
  return { currentTask };
}

export async function action({ request }: ActionFunctionArgs) {
  return formAction(
    request,
    markDoneSchema,
    async (values) => {
      await markTaskDone(values.id);
      return null;
    },
    { humanName: "mark the to-do done", hiddenFields: ["id"] },
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Diswantin" },
    {
      name: "description",
      content:
        "Diswantin is a productivity app that shows you the one thing to do right now",
    },
  ];
};

export default function Index() {
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

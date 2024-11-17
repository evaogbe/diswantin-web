import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { getCurrentTask, markTaskDone } from "~/task/services.server";

export async function loader() {
  const currentTask = await getCurrentTask();
  return { currentTask };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await markTaskDone(String(formData.get("id")));
  return null;
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
  const fetcher = useFetcher();
  return (
    <article aria-labelledby="current-todo-heading">
      <h2 id="current-todo-heading">Current to-do</h2>
      {currentTask != null ? (
        <>
          <p>{currentTask.name}</p>
          <fetcher.Form method="post">
            <div hidden>
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

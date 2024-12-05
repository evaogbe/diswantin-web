import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as v from "valibot";
import { getTaskDetail } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";

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

export const meta: MetaFunction<typeof loader> = ({ data, error }) => {
  return [
    { title: getTitle({ page: data?.task.name ?? "To-do Detail", error }) },
  ];
};

export default function TaskDetailRoute() {
  const { task } = useLoaderData<typeof loader>();

  return (
    <Page aria-labelledby="todo-detail-heading">
      <PageHeading id="todo-detail-heading">{task.name}</PageHeading>
      <dl>
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

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { getAuthenticatedUser } from "./services.server";
import { AppHead } from "~/components/app-head";
import { GenericErrorBoundary } from "~/error/generic-error-boundary";
import { getTitle } from "~/utils/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  await getAuthenticatedUser(request);
  return { isAuthenticated: true };
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ error }) }];
};

export default function AuthLayout() {
  return (
    <>
      <AppHead isAuthenticated />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export function ErrorBoundary() {
  const data = useRouteLoaderData<typeof loader>("auth/layout.route");

  return (
    <>
      <AppHead isAuthenticated={data?.isAuthenticated === true} />
      <main>
        <GenericErrorBoundary />
      </main>
    </>
  );
}

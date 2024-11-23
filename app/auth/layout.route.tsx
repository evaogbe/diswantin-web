import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { getAuthenticatedUser } from "./services.server";
import { GenericErrorBoundary } from "~/error/generic-error-boundary";
import { AppHeader } from "~/head/app-header";
import { getTitle } from "~/head/meta";

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
      <AppHeader isAuthenticated />
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
      <AppHeader isAuthenticated={data?.isAuthenticated === true} />
      <main>
        <GenericErrorBoundary />
      </main>
    </>
  );
}

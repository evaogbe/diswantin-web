import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { getAuthenticatedUser } from "./services.server";
import { GenericErrorBoundary } from "~/error/generic-error-boundary";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  await getAuthenticatedUser(request);
  return { isAuthenticated: true };
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ error }) }];
};

export default function AuthLayout() {
  return (
    <MainLayout isAuthenticated>
      <Outlet />
    </MainLayout>
  );
}

export function ErrorBoundary() {
  const data = useRouteLoaderData<typeof loader>("auth/layout.route");

  return (
    <MainLayout isAuthenticated={data?.isAuthenticated === true}>
      <GenericErrorBoundary />
    </MainLayout>
  );
}

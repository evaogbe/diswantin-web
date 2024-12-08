import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { isFullyAuthenticated } from "~/auth/services.server";
import { GeneralErrorBoundary } from "~/error/general-error-boundary";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  const isAuthenticated = await isFullyAuthenticated(request);
  return { isAuthenticated };
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ error }) }];
};

export default function AuthLayout() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <Outlet />
    </MainLayout>
  );
}

export function ErrorBoundary() {
  const data = useRouteLoaderData<typeof loader>("main-layout.route");
  const isAuthenticated = Boolean(data?.isAuthenticated);

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <GeneralErrorBoundary isAuthenticated={isAuthenticated} />
    </MainLayout>
  );
}

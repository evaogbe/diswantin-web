import { Outlet } from "react-router";
import type { Route } from "./+types/main-layout.route";
import { isFullyAuthenticated } from "~/auth/services.server";
import { GeneralErrorBoundary } from "~/error/general-error-boundary";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";

export async function loader({ request }: Route.LoaderArgs) {
  const isAuthenticated = await isFullyAuthenticated(request);
  return { isAuthenticated };
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ error }) }];
}

export default function MainLayoutRoute({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated } = loaderData;

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <Outlet />
    </MainLayout>
  );
}

export function ErrorBoundary({ loaderData }: Route.ErrorBoundaryProps) {
  const isAuthenticated = Boolean(loaderData?.isAuthenticated);

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <GeneralErrorBoundary isAuthenticated={isAuthenticated} />
    </MainLayout>
  );
}

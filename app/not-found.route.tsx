import { data } from "react-router";
import type { Route } from "./+types/not-found.route";
import { isFullyAuthenticated } from "~/auth/services.server";
import { NotFoundPage } from "~/error/not-found-page";
import { getTitle } from "~/layout/meta";

export async function loader({ request }: Route.LoaderArgs) {
  const isAuthenticated = await isFullyAuthenticated(request);
  return data({ isAuthenticated }, 404);
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Page not found", error }) }];
}

export default function NotFoundRoute({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated } = loaderData;

  return <NotFoundPage homePath={isAuthenticated ? "/home" : "/"} />;
}

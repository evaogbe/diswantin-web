import { data } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { isFullyAuthenticated } from "~/auth/services.server";
import { NotFoundPage } from "~/error/not-found-page";
import { getTitle } from "~/layout/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  const isAuthenticated = await isFullyAuthenticated(request);
  return data({ isAuthenticated }, 404);
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "Page not found", error }) }];
};

export default function NotFoundRoute() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return <NotFoundPage homePath={isAuthenticated ? "/home" : "/"} />;
}

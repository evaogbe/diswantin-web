import { data } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { NotFoundPage } from "./not-found-page";
import { isFullyAuthenticated } from "~/auth/services.server";
import { MainLayout } from "~/layout/main-layout";
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

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <NotFoundPage homePath={isAuthenticated ? "/home" : "/"} />
    </MainLayout>
  );
}

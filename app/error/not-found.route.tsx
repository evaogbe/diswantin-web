import { data } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { isFullyAuthenticated } from "~/auth/services.server";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Link } from "~/ui/link";

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
      <Page aria-labelledby="page-not-found-heading" className="space-y-sm">
        <PageHeading id="page-not-found-heading">Page not found</PageHeading>
        <p className="leading-7">
          The page you were looking for could not be found. Perhaps you typed in
          the URL wrong or the page has been removed.
        </p>
        <p className="leading-7">
          <Link to={isAuthenticated ? "/home" : "/"}>Return home</Link>
        </p>
      </Page>
    </MainLayout>
  );
}

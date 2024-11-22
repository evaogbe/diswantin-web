import { data } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, MetaFunction, useLoaderData } from "@remix-run/react";
import { getIsAuthenticated } from "~/auth/services.server";
import { AppHead } from "~/components/app-head";
import { getTitle } from "~/utils/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  const isAuthenticated = await getIsAuthenticated(request);
  return data({ isAuthenticated }, 404);
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "Page not found", error }) }];
};

export default function NotFoundRoute() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  return (
    <>
      <AppHead isAuthenticated={isAuthenticated} />
      <article aria-labelledby="page-not-found-heading">
        <h2 id="page-not-found-heading">Page not found</h2>
        <p>
          The page you were looking for could not be found. Perhaps you typed in
          the URL wrong or the page has been removed.
        </p>
        <p>
          <Link to={isAuthenticated ? "/home" : "/"}>Return home</Link>
        </p>
      </article>
    </>
  );
}

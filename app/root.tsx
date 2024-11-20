import { data } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { PublicEnvScript, initPublicEnv } from "~/env/public";
import { csrf } from "~/utils/csrf.server";
import { useNonce } from "~/utils/nonce";

if (initPublicEnv != null) {
  await initPublicEnv();
}

export async function loader() {
  const [csrfToken, csrfCookie] = await csrf.commitToken();
  return data(
    { csrfToken },
    csrfCookie != null ? { headers: { "Set-Cookie": csrfCookie } } : undefined,
  );
}

export const meta: MetaFunction = ({ error }) => {
  if (error == null) {
    return [];
  }

  let title = "";
  switch (isRouteErrorResponse(error) ? error.status : 500) {
    case 403: {
      title = "Access denied";
      break;
    }
    case 404: {
      title = "Page not found";
      break;
    }
    default: {
      title = "Unexpected error";
    }
  }

  return [{ title: `${title} | Diswantin` }];
};

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <h1>
            <Link to="/">Diswantin</Link>
          </h1>
          <nav>
            <ul>
              <li>
                <Link to="/new-todo">New to-do</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>{children}</main>
        <PublicEnvScript nonce={nonce} />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function App() {
  const { csrfToken } = useLoaderData<typeof loader>();
  return (
    <AuthenticityTokenProvider token={csrfToken}>
      <Outlet />
    </AuthenticityTokenProvider>
  );
}

export default withSentry(App);

export const ErrorBoundary = () => {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  switch (isRouteErrorResponse(error) ? error.status : 500) {
    case 403: {
      return (
        <article aria-labelledby="access-denied-heading">
          <h2 id="access-denied-heading">Access denied</h2>
          <p>You are not allowed to do that</p>
        </article>
      );
    }
    case 404: {
      return (
        <article aria-labelledby="page-not-found-heading">
          <h2 id="page-not-found-heading">Page not found</h2>
          <p>
            The page you were looking for could not be found. Perhaps you typed
            in the URL wrong or the page has been removed.
          </p>
          <p>
            <Link to="/">Return home</Link>
          </p>
        </article>
      );
    }
    default: {
      return (
        <article aria-labelledby="unexpected-error-heading">
          <h2 id="unexpected-error-heading">Unexpected error</h2>
          <p>
            We&apos;re experiencing unexpected technical difficulties. Please
            try again later. Thank you for your patience.
          </p>
        </article>
      );
    }
  }
};

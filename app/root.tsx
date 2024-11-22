import { data } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { withSentry } from "@sentry/remix";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { AppHead } from "~/components/app-head";
import { useNonce } from "~/components/nonce";
import { PublicEnvScript, initPublicEnv } from "~/env/public";
import { GenericErrorBoundary } from "~/error/generic-error-boundary";
import { csrf } from "~/services.server/csrf";
import { getTitle } from "~/utils/meta";

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
  return [{ title: getTitle({ error }) }];
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
        {children}
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

export function ErrorBoundary() {
  return (
    <>
      <AppHead isAuthenticated={false} />
      <GenericErrorBoundary />
    </>
  );
}

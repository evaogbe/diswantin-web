import { data } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData,
} from "@remix-run/react";
import { withSentry } from "@sentry/remix";
import { clsx } from "clsx";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { PublicEnvScript, initPublicEnv } from "~/env/public";
import { GenericErrorBoundary } from "~/error/generic-error-boundary";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";
import { csrf } from "~/security/csrf.server";
import { useNonce } from "~/security/nonce";
import { themeSessionResolver } from "~/theme/session.server";
import "@fontsource-variable/nunito-sans";
import "./app.css";

if (initPublicEnv != null) {
  await initPublicEnv();
}

export async function loader({ request }: LoaderFunctionArgs) {
  const [csrfToken, csrfCookie] = await csrf.commitToken();
  const { getTheme } = await themeSessionResolver(request);
  return data(
    { csrfToken, theme: getTheme() },
    csrfCookie != null ? { headers: { "Set-Cookie": csrfCookie } } : undefined,
  );
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ error }) }];
};

function BaseLayout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  const nonce = useNonce();
  const [theme] = useTheme();

  return (
    <html lang="en" dir="ltr" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <PreventFlashOnWrongTheme
          ssrTheme={Boolean(data?.theme)}
          nonce={nonce}
        />
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

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");
  return (
    <ThemeProvider
      specifiedTheme={data?.theme ?? null}
      themeAction="/resources/theme"
    >
      <BaseLayout>{children}</BaseLayout>
    </ThemeProvider>
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
    <MainLayout isAuthenticated={false}>
      <GenericErrorBoundary />
    </MainLayout>
  );
}

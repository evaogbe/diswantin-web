import { clsx } from "clsx";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
  useRouteLoaderData,
} from "react-router";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import type { Route } from "./+types/root";
import { PublicEnvScript, initPublicEnv } from "~/env/public";
import { GeneralErrorBoundary } from "~/error/general-error-boundary";
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

export async function loader({ request }: Route.LoaderArgs) {
  const [csrfToken, csrfCookie] = await csrf.commitToken();
  const { getTheme } = await themeSessionResolver(request);
  return data(
    { csrfToken, theme: getTheme() },
    csrfCookie != null ? { headers: { "Set-Cookie": csrfCookie } } : undefined,
  );
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ error }) }];
}

export const links: Route.LinksFunction = () => {
  return [
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      sizes: "32x32",
      href: "/favicon-32x32.png",
      type: "image/png",
    },
    {
      rel: "icon",
      sizes: "16x16",
      href: "/favicon-32x32.png",
      type: "image/png",
    },
    {
      rel: "manifest",
      href: "/site.webmanifest",
    },
  ];
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

export default function App({ loaderData }: Route.ComponentProps) {
  const { csrfToken } = loaderData;

  return (
    <AuthenticityTokenProvider token={csrfToken}>
      <Outlet />
    </AuthenticityTokenProvider>
  );
}

export function ErrorBoundary() {
  return (
    <MainLayout isAuthenticated={false}>
      <GeneralErrorBoundary />
    </MainLayout>
  );
}

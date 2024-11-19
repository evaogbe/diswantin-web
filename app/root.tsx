import { data } from "@remix-run/node";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { AuthenticityTokenProvider } from "remix-utils/csrf/react";
import { csrf } from "~/system.server/csrf";
import { useNonce } from "~/utils/nonce";

export async function loader() {
  const [csrfToken, csrfCookie] = await csrf.commitToken();
  return data(
    { csrfToken },
    csrfCookie != null ? { headers: { "Set-Cookie": csrfCookie } } : undefined,
  );
}

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
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const { csrfToken } = useLoaderData<typeof loader>();
  return (
    <AuthenticityTokenProvider token={csrfToken}>
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
      <main>
        <Outlet />
      </main>
    </AuthenticityTokenProvider>
  );
}

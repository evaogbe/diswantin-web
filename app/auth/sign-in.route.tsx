import { generateCodeVerifier, generateState } from "arctic";
import { CircleCheck } from "lucide-react";
import { data, Form, redirect } from "react-router";
import type { Route } from "./+types/sign-in.route";
import { codeVerifierCookie, google, stateCookie } from "./google.server";
import { getFlashMessage, redirectAuthenticated } from "./services.server";
import { GuestFooter } from "~/layout/guest-footer";
import { getTitle } from "~/layout/meta";
import { ThemeToggle } from "~/theme/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { Link } from "~/ui/link";
import "./sign-in.route.css";

export async function loader({ request }: Route.LoaderArgs) {
  await redirectAuthenticated(request);
  const [flashMessage, flashCookie] = await getFlashMessage(request);
  return data({ flashMessage }, { headers: { "Set-Cookie": flashCookie } });
}

export async function action({ request }: Route.ActionArgs) {
  await redirectAuthenticated(request);
  console.log("Sign in requested");
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);
  return redirect(url.toString(), {
    status: 303,
    headers: [
      ["Set-Cookie", await stateCookie.serialize(state)],
      ["Set-Cookie", await codeVerifierCookie.serialize(codeVerifier)],
    ],
  });
}

export function meta({ error }: Route.MetaArgs) {
  return [
    { title: getTitle({ error }) },
    {
      name: "description",
      content:
        "Diswantin is a productivity app that shows you the one thing to do right now",
    },
  ];
}

export default function SignInRoute({ loaderData }: Route.ComponentProps) {
  const { flashMessage } = loaderData;

  return (
    <div className="flex min-h-svh min-w-fit flex-col">
      <header className="border-primary-container bg-primary-container p-fl-2xs dark:border-accent top-0 z-10 flex justify-end border-b shadow-sm sm:sticky">
        <ThemeToggle />
      </header>
      <main className="p-fl-sm flex-1">
        {flashMessage != null && (
          <Alert
            variant="success"
            aria-labelledby="flash-heading"
            className="mb-fl-xs mx-auto max-w-prose"
          >
            <CircleCheck aria-hidden="true" className="size-fl-xs" />
            <AlertTitle level={2} id="flash-heading">
              Success
            </AlertTitle>
            <AlertDescription>{flashMessage}</AlertDescription>
          </Alert>
        )}
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Diswantin
        </h1>
        <p className="max-w-prose text-2xl tracking-tight">
          The app that shows you the one thing to do right now.
        </p>
        <Form method="post" className="mt-fl-xs" reloadDocument>
          <p>
            <button className="gsi-material-button">
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    className="block"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  Sign in with Google
                </span>
                <span className="hidden">Sign in with Google</span>
              </div>
            </button>
          </p>
          <p className="mt-xs">
            <small>
              By signing in you accept our{" "}
              <Link to="/terms">Terms of Service</Link>
            </small>
          </p>
        </Form>
      </main>
      <GuestFooter />
    </div>
  );
}

import { data, redirect } from "@remix-run/node";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { generateState, generateCodeVerifier } from "arctic";
import { CircleCheck } from "lucide-react";
import { google, stateCookie, codeVerifierCookie } from "./google.server";
import { getFlashMessage, redirectAuthenticated } from "./services.server";
import { getTitle } from "~/layout/meta";
import { ThemeToggle } from "~/theme/theme-toggle";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectAuthenticated(request);
  const [flashMessage, flashCookie] = await getFlashMessage(request);
  return data({ flashMessage }, { headers: { "Set-Cookie": flashCookie } });
}

export async function action({ request }: ActionFunctionArgs) {
  await redirectAuthenticated(request);
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

export const meta: MetaFunction = ({ error }) => {
  return [
    { title: getTitle({ error }) },
    {
      name: "description",
      content:
        "Diswantin is a productivity app that shows you the one thing to do right now",
    },
  ];
};

export default function SignInRoute() {
  const { flashMessage } = useLoaderData<typeof loader>();

  return (
    <>
      <header className="sticky top-0 z-10 flex justify-end border-b border-primary-container bg-primary-container p-2xs shadow dark:border-accent">
        <ThemeToggle />
      </header>
      <main className="p-sm">
        {flashMessage != null && (
          <Alert
            variant="success"
            aria-labelledby="flash-heading"
            className="mx-auto max-w-prose"
          >
            <CircleCheck aria-hidden="true" className="size-xs" />
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
        <Form method="post" className="mt-xs">
          <p>
            <Button>Sign in with Google</Button>
          </p>
        </Form>
      </main>
    </>
  );
}

import { data, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { generateState, generateCodeVerifier } from "arctic";
import { google, stateCookie, codeVerifierCookie } from "./google.server";
import { getFlashMessage, redirectAuthenticated } from "./services.server";
import { getTitle } from "~/head/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  await redirectAuthenticated(request);
  const [flashMessage, flashCookie] = await getFlashMessage(request);
  return data({ flashMessage }, { headers: { "Set-Cookie": flashCookie } });
}

export async function action() {
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

export default function SignIn() {
  const { flashMessage } = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>Diswantin</h1>
      <p>The app that shows you the one thing to do right now</p>
      {flashMessage != null && (
        <section aria-labelledby="flash-heading">
          <h2 id="flash-heading">Success</h2>
          <p>{flashMessage}</p>
        </section>
      )}
      <Form method="post">
        <p>
          <button>Sign in with Google</button>
        </p>
      </Form>
    </main>
  );
}

import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { generateState, generateCodeVerifier } from "arctic";
import { google, stateCookie, codeVerifierCookie } from "./google.server";
import { redirectAuthenticated } from "./services.server";
import { getTitle } from "~/utils/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  return await redirectAuthenticated(request);
}

export async function action() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
  ]);
  return redirect(url.toString(), {
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
  return (
    <main>
      <h1>Diswantin</h1>
      <p>The app that shows you the one thing to do right now</p>
      <Form method="post">
        <p>
          <button>Sign in with Google</button>
        </p>
      </Form>
    </main>
  );
}

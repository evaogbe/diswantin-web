import { createCookie } from "@remix-run/node";
import { Google } from "arctic";
import { env } from "~/env/private.server";

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

export const stateCookie = createCookie("google_oauth_state", {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 10,
});

export const codeVerifierCookie = createCookie("google_code_verifier", {
  path: "/",
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 10,
});

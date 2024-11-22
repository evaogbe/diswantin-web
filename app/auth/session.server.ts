import { createCookie, createCookieSessionStorage } from "@remix-run/node";
import { env } from "~/env/private.server";

const sessionCookie = createCookie("_session", {
  sameSite: "lax",
  path: "/",
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 10,
  secrets: [env.SESSION_SECRET],
  secure: env.NODE_ENV === "production",
});

const sessionStorage = createCookieSessionStorage({
  cookie: sessionCookie,
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function extendSession(
  request: Request,
  responseHeaders: Headers,
) {
  let cookieValue: unknown = await sessionCookie.parse(
    responseHeaders.get("set-cookie"),
  );
  if (cookieValue != null) return;

  cookieValue = await sessionCookie.parse(request.headers.get("cookie"));
  if (cookieValue == null) return;

  responseHeaders.append(
    "Set-Cookie",
    await sessionCookie.serialize(cookieValue),
  );
}

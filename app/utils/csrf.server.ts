import { createCookie } from "@remix-run/node";
import { CSRF } from "remix-utils/csrf/server";
import { env } from "~/env/private.server";

export const csrf = new CSRF({
  cookie: createCookie("csrf", {
    path: "/",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    secrets: [env.CSRF_SECRET],
  }),
  secret: env.CSRF_SECRET,
});

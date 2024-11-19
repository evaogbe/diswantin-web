import { createCookie } from "@remix-run/node";
import { CSRF } from "remix-utils/csrf/server";
import { env } from "~/system.server/env";

export const csrf = new CSRF({
  cookie: createCookie("csrf", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    secrets: [env.CSRF_SECRET],
  }),
  secret: env.CSRF_SECRET,
});

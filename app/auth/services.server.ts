import { redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { uid } from "uid";
import * as v from "valibot";
import { getSession, destroySession, commitSession } from "./session.server";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";

export async function getIsAuthenticated(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.has("userId");
}

export async function redirectAuthenticated(request: Request) {
  if (await getIsAuthenticated(request)) {
    throw redirect("/home", 303);
  }

  return null;
}

export async function getAuthenticatedUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userClientId: unknown = session.get("userId");
  if (typeof userClientId !== "string") {
    throw redirect("/", 303);
  }

  const [user] = await db
    .select({ id: table.user.id, email: table.user.email })
    .from(table.user)
    .where(eq(table.user.clientId, userClientId))
    .limit(1);

  if (user == null) {
    throw redirect("/", {
      status: 303,
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  return user;
}

export async function authenticate(request: Request, userClientId: string) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", userClientId);
  return redirect("/home", {
    status: 303,
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function invalidateSession(message: string) {
  const session = await getSession();
  session.flash("message", message);
  return redirect("/", {
    status: 303,
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

const flashMessageSchema = v.optional(v.string());

export async function getFlashMessage(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const message: unknown = session.get("message");
  return [
    v.parse(flashMessageSchema, message),
    await commitSession(session),
  ] as const;
}

export async function getClientIdByGoogleId(googleId: string) {
  const [account] = await db
    .select({ clientId: table.user.clientId })
    .from(table.user)
    .where(eq(table.user.googleId, googleId))
    .limit(1);
  return account?.clientId;
}

export async function createUser(user: { googleId: string; email: string }) {
  const clientId = uid();
  await db
    .insert(table.user)
    .values({ clientId, googleId: user.googleId, email: user.email });
  return clientId;
}

export async function deleteUser(userId: number) {
  await db.delete(table.user).where(eq(table.user.id, userId));
}

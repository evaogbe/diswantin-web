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
    throw redirect("/home");
  }

  return null;
}

export async function getAuthenticatedUser(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId: unknown = session.get("userId");
  if (typeof userId !== "string") {
    throw redirect("/");
  }

  const [user] = await db
    .select({ id: table.user.id, email: table.user.email })
    .from(table.user)
    .where(eq(table.user.userId, userId))
    .limit(1);

  if (user == null) {
    throw redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  return user;
}

export async function authenticate(request: Request, userId: string) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", userId);
  return redirect("/home", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function invalidateSession(message: string) {
  const session = await getSession();
  session.flash("message", message);
  return redirect("/", {
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

export async function getUserIdByGoogleId(googleId: string) {
  const [account] = await db
    .select({ userId: table.user.userId })
    .from(table.user)
    .where(eq(table.user.googleId, googleId))
    .limit(1);
  return account?.userId;
}

export async function createUser(user: { googleId: string; email: string }) {
  const userId = uid();
  await db
    .insert(table.user)
    .values({ userId, googleId: user.googleId, email: user.email });
  return userId;
}

export async function deleteUser(pk: number) {
  await db.delete(table.user).where(eq(table.user.id, pk));
}

import { redirect } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { uid } from "uid";
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

export async function getAuthenticatedUserId(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId: unknown = session.get("userId");
  if (typeof userId !== "string") {
    throw redirect("/");
  }

  const [user] = await db
    .select({ id: table.user.id })
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

  return user.id;
}

export async function getOrCreateAccountByGoogleId(googleId: string) {
  const [existingAccount] = await db
    .select({ userId: table.user.userId })
    .from(table.user)
    .where(eq(table.user.googleId, googleId))
    .limit(1);
  if (existingAccount != null) {
    return existingAccount;
  }

  const [newAccount] = await db
    .insert(table.user)
    .values({ userId: uid(), googleId })
    .returning({ userId: table.user.userId });
  if (newAccount == null) {
    throw new Error("Could not create user");
  }
  return newAccount;
}

export async function authenticate(
  request: Request,
  account: { userId: string },
) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", account.userId);
  return redirect("/home", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function invalidateSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

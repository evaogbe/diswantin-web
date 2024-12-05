import { data, redirect } from "@remix-run/node";
import type { Session } from "@remix-run/node";
import { eq } from "drizzle-orm";
import { uid } from "uid";
import * as v from "valibot";
import type { Credentials } from "./model";
import { getSession, destroySession, commitSession } from "./session.server";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";

export async function getAccountByGoogleId(googleId: string) {
  const [account] = await db
    .select({ clientId: table.user.clientId, timeZone: table.user.timeZone })
    .from(table.user)
    .where(eq(table.user.googleId, googleId))
    .limit(1);
  return account;
}

type Account = NonNullable<Awaited<ReturnType<typeof getAccountByGoogleId>>>;

export async function createUser(user: Credentials) {
  const clientId = uid();
  await db
    .insert(table.user)
    .values({ clientId, googleId: user.sub, email: user.email });
  return clientId;
}

export async function deleteUser(userId: number) {
  await db.delete(table.user).where(eq(table.user.id, userId));
}

export async function updateTimeZone(userId: number, timeZone: string) {
  await db
    .update(table.user)
    .set({ timeZone })
    .where(eq(table.user.id, userId));
}

export async function authenticate(request: Request, account: Account) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", account.clientId);
  return redirect(account.timeZone == null ? "/onboarding" : "/home", {
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

async function getUserBySession(session: Session) {
  const userClientId: unknown = session.get("userId");
  if (typeof userClientId !== "string") {
    return null;
  }

  const [user] = await db
    .select({
      id: table.user.id,
      email: table.user.email,
      timeZone: table.user.timeZone,
    })
    .from(table.user)
    .where(eq(table.user.clientId, userClientId))
    .limit(1);

  return user;
}

type User = NonNullable<Awaited<ReturnType<typeof getUserBySession>>>;
type FreshUser = User & { timeZone: null };
type FullUser = User & { timeZone: NonNullable<User["timeZone"]> };

export async function isFullyAuthenticated(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await getUserBySession(session);
  return user?.timeZone != null;
}

export function getAuthenticatedUser(
  request: Request,
  opts: { fresh: true },
): Promise<FreshUser>;
export function getAuthenticatedUser(
  request: Request,
  opts?: { fresh?: false },
): Promise<FullUser>;
export async function getAuthenticatedUser(
  request: Request,
  opts: { fresh?: boolean } = {},
) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await getUserBySession(session);

  if (user == null) {
    throw redirect("/", {
      status: 303,
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  if (opts.fresh && user.timeZone != null) {
    throw redirect("/home", 303);
  }

  if (!opts.fresh && user.timeZone == null) {
    throw redirect("/onboarding", 303);
  }

  return user;
}

export async function redirectAuthenticated(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await getUserBySession(session);

  if (user != null) {
    throw redirect(user.timeZone == null ? "/onboarding" : "/home", 303);
  }

  return data(null, {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}

import { faker } from "@faker-js/faker";
import { parse } from "cookie";
import { createUser } from "~/auth/services.server";
import { getSession, commitSession } from "~/auth/session.server";

const userIdsByTestId = new Map<number, string>();

export async function getAuthSession(testId: number) {
  let userId = userIdsByTestId.get(testId);
  if (userId == null) {
    userId = await createUser({
      googleId: faker.string.uuid(),
      email: faker.internet.email(),
    });
    userIdsByTestId.set(testId, userId);
  }

  const session = await getSession();
  session.set("userId", userId);
  const cookie = await commitSession(session);
  return parse(cookie)._session!;
}

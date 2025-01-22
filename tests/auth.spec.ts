import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import { parse } from "cookie";
import { getAuthSession } from "../playwright/test-data";
import { createUser } from "~/auth/services.server";
import { commitSession, getSession } from "~/auth/session.server";

test("can sign in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in with Google" }).click();

  const cookies = await page.context().cookies();
  const stateCookie = cookies.find(
    (cookie) => cookie.name === "google_oauth_state",
  );
  expect(stateCookie).toBeTruthy();

  const codeVerifier = cookies.find(
    (cookie) => cookie.name === "google_code_verifier",
  );
  expect(codeVerifier).toBeTruthy();
});

test("can sign out", async ({ page }) => {
  const id = test.info().parallelIndex;
  const session = await getAuthSession(id);

  await page.goto("/");
  await page.context().addCookies([
    {
      name: "_session",
      value: session,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/onboarding");
  await page.getByTestId("time-zone-button").click();
  await page.getByRole("option", { name: "America/Los_Angeles" }).click();
  await page.getByRole("button", { name: "America/Los_Angeles" }).click();
  await page.getByRole("button", { name: "Save" }).click();

  await expect(
    page.getByRole("article", { name: "Current to-do" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(
    page.getByRole("alert", { name: "Success" }).getByText("Signed out"),
  ).toBeVisible();
});

test("can delete account", async ({ page }) => {
  const email = faker.internet.email();
  const userId = await createUser({
    sub: faker.string.uuid(),
    email,
  });
  const session = await getSession();
  session.set("userId", userId);
  const cookie = await commitSession(session);

  await page.goto("/");
  await page.context().addCookies([
    {
      name: "_session",
      value: parse(cookie)._session!,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/onboarding");
  await page.getByTestId("time-zone-button").click();
  await page.getByRole("option", { name: "America/Los_Angeles" }).click();
  await page.getByRole("button", { name: "America/Los_Angeles" }).click();
  await page.getByRole("button", { name: "Save" }).click();

  await expect(
    page.getByRole("article", { name: "Current to-do" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Settings" }).click();

  await expect(
    page.getByRole("paragraph").filter({ hasText: "America/Los_Angeles" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Delete account" }).click();
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Delete account" }).click();

  await expect(
    page.getByRole("alert", { name: "Success" }).getByText("Account deleted"),
  ).toBeVisible();
});

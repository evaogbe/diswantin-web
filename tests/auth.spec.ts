import { test, expect } from "@playwright/test";
import { getAuthSession } from "../playwright/test-data";

test("can sign in", async ({ page }) => {
  const id = test.info().parallelIndex;
  const session = await getAuthSession(id);

  await page.goto("http://localhost:8811");
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
  await page.goto("http://localhost:8811/onboarding");
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

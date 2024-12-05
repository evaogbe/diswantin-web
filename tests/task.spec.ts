import { faker } from "@faker-js/faker";
import { test, expect } from "../playwright/fixtures";

test("can create task", async ({ page }) => {
  const taskName = faker.lorem.words();

  await page.goto("/home");
  await page.getByRole("link", { name: "New to-do" }).click();
  await page.getByLabel("Name").fill(taskName);
  await page.getByRole("button", { name: "Save" }).click();

  const currentTaskArticle = page.getByRole("article", {
    name: "Current to-do",
  });
  await expect(currentTaskArticle.getByText(taskName)).toBeVisible();

  await page.getByRole("button", { name: "Done" }).click();
  await expect(
    currentTaskArticle.getByText("No upcoming to-dos"),
  ).toBeVisible();
});

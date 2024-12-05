// Need to use wildcard import
/* eslint-disable import-x/export */
import fs from "node:fs";
import path from "node:path";
import { test as baseTest, expect } from "@playwright/test";
import { getAuthSession } from "./test-data";

export * from "@playwright/test";

export const test = baseTest.extend<object, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [
    async ({ browser }, use) => {
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (fs.existsSync(fileName)) {
        await use(fileName);
        return;
      }

      const page = await browser.newPage({ storageState: undefined });
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

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: "worker" },
  ],
});

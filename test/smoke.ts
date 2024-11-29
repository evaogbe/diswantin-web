import { faker } from "@faker-js/faker";
import { parse } from "cookie";
import { createUser } from "~/auth/services.server";
import { getSession, commitSession } from "~/auth/session.server";

async function createAuthSession() {
  const userId = await createUser({
    googleId: faker.string.uuid(),
    email: faker.internet.email(),
  });
  const session = await getSession();
  session.set("userId", userId);
  const cookie = await commitSession(session);
  return parse(cookie)._session!;
}

describe("Smoke test", function () {
  it("can create task", async (browser) => {
    const session = await createAuthSession();
    const taskName = faker.lorem.words();

    await browser.navigateTo("/");
    await browser.cookies.set({
      name: "_session",
      value: session,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    });
    await browser.navigateTo("/home");

    const newTaskLink = await browser.getByRole("link", { name: "New to-do" });
    await newTaskLink.click();

    const nameInput = await browser.findByLabelText("Name");
    await nameInput.sendKeys(taskName);

    const saveButton = await browser.getByRole("button", { name: "Save" });
    await saveButton.click();

    const currentTaskArticle = await browser.findByRole("article", {
      name: "Current to-do",
    });
    const currentTaskParagraph = await browser
      .within(currentTaskArticle)
      .getByText(taskName);
    await browser.expect(currentTaskParagraph).to.be.present;

    const doneButton = await browser.getByRole("button", { name: "Done" });
    await doneButton.click();

    const emptyMessage = await browser
      .within(currentTaskArticle)
      .findByText("No upcoming to-dos");
    await browser.expect(emptyMessage).to.be.present;
  });
});

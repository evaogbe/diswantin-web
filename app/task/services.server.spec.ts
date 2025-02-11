import { faker } from "@faker-js/faker";
import { parseISO } from "date-fns";
import { eq, inArray, or } from "drizzle-orm";
import { describe, expect, test } from "vitest";
import type { TaskForm } from "./model";
import * as services from "./services.server";
import { db } from "~/db.server";
import * as table from "~/db.server/schema";

const uid = services.seqId;

describe("getCurrentTask", () => {
  test("returns nullish without tasks", async () => {
    const user = await createTestUser("America/Los_Angeles");

    await expect(
      services.getCurrentTask(user, parseISO("2025-01-23T08:00:00Z")),
    ).resolves.toBeNil();
  });
  test("returns first undone task", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId1 = (await services.createTask(taskForm1, user))!;

    await expect(
      services.getCurrentTask(user, parseISO("2025-01-22T08:00:00Z")),
    ).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
    });

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
    };
    const taskId2 = (await services.createTask(taskForm2, user))!;

    await expect(
      services.getCurrentTask(user, parseISO("2025-01-22T08:00:00Z")),
    ).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });

    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId2, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      services.getCurrentTask(user, parseISO("2025-01-22T08:00:00Z")),
    ).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
    });
    await expect(
      services.getCurrentTask(user, parseISO("2025-01-23T08:00:00Z")),
    ).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });

    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId1, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      services.getCurrentTask(user, parseISO("2025-01-22T08:00:00Z")),
    ).resolves.toBeNil();
    await expect(
      services.getCurrentTask(user, parseISO("2025-01-23T08:00:00Z")),
    ).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });
  });
  test("returns first scheduled task when task scheduled in past", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2025-01-23T08:01:00Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      scheduledAt: {
        date: "2025-01-23",
        time: "00:02",
      },
    };
    await services.createTask(taskForm1, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
      scheduledAt: {
        time: "00:02",
      },
    };
    await services.createTask(taskForm2, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm3, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm3.id,
      name: taskForm3.name,
      note: null,
    });

    const taskForm4: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
    };
    await services.createTask(taskForm4, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm4.id,
      name: taskForm4.name,
      note: null,
    });

    const taskForm5: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      scheduledAt: {
        date: "2025-01-23",
        time: "00:01",
      },
    };
    await services.createTask(taskForm5, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm5.id,
      name: taskForm5.name,
      note: null,
    });

    const taskForm6: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
      scheduledAt: {
        time: "00:01",
      },
    };
    await services.createTask(taskForm6, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm6.id,
      name: taskForm6.name,
      note: null,
    });

    const taskForm7: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      scheduledAt: {
        date: "2025-01-23",
      },
    };
    await services.createTask(taskForm7, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm7.id,
      name: taskForm7.name,
      note: null,
    });

    const taskForm8: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      scheduledAt: {
        date: "2025-01-22",
        time: "00:02",
      },
    };
    await services.createTask(taskForm8, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm8.id,
      name: taskForm8.name,
      note: null,
    });
  });
  test("returns task when task starts after past", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2025-01-23T08:01:00Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      startAfter: {
        date: "2025-01-23",
        time: "00:02",
      },
    };
    await services.createTask(taskForm1, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      startAfter: {
        date: "2025-01-22",
        time: "00:02",
      },
    };
    await services.createTask(taskForm2, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
      startAfter: {
        time: "00:02",
      },
    };
    await services.createTask(taskForm3, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm4: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      startAfter: {
        date: "2025-01-23",
        time: "00:01",
      },
    };
    await services.createTask(taskForm4, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm4.id,
      name: taskForm4.name,
      note: null,
    });

    const taskForm5: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      startAfter: {
        date: "2025-01-23",
      },
    };
    await services.createTask(taskForm5, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm5.id,
      name: taskForm5.name,
      note: null,
    });

    const taskForm6: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      startAfter: {
        time: "00:01",
      },
    };
    await services.createTask(taskForm6, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm6.id,
      name: taskForm6.name,
      note: null,
    });

    const taskForm7: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm7, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm7.id,
      name: taskForm7.name,
      note: null,
    });

    const taskForm8: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
      startAfter: {
        time: "00:01",
      },
    };
    await services.createTask(taskForm8, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm8.id,
      name: taskForm8.name,
      note: null,
    });

    const taskForm9: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
    };
    await services.createTask(taskForm9, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm9.id,
      name: taskForm9.name,
      note: null,
    });
  });
  test("returns task when task recurs daily", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2025-01-23T08:00:00Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 2 },
    };
    await services.createTask(taskForm1, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
    };
    await services.createTask(taskForm2, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });
  });
  test.each([
    ["2020-02-29", "2023-02-28"],
    ["2022-01-31", "2023-02-28"],
    ["2022-01-31", "2023-04-30"],
    ["2022-01-31", "2023-06-30"],
    ["2022-01-31", "2023-09-30"],
    ["2022-01-31", "2023-11-30"],
    ["2022-01-31", "2024-02-29"],
    ["2022-03-31", "2023-02-28"],
    ["2022-03-31", "2023-04-30"],
    ["2022-03-31", "2023-06-30"],
    ["2022-03-31", "2023-09-30"],
    ["2022-03-31", "2023-11-30"],
    ["2022-03-31", "2024-02-29"],
    ["2022-04-30", "2023-02-28"],
    ["2022-04-30", "2023-04-30"],
    ["2022-04-30", "2023-06-30"],
    ["2022-04-30", "2023-09-30"],
    ["2022-04-30", "2023-11-30"],
    ["2022-04-30", "2024-02-29"],
    ["2022-05-31", "2023-02-28"],
    ["2022-05-31", "2023-04-30"],
    ["2022-05-31", "2023-06-30"],
    ["2022-05-31", "2023-09-30"],
    ["2022-05-31", "2023-11-30"],
    ["2022-05-31", "2024-02-29"],
    ["2022-06-30", "2023-02-28"],
    ["2022-06-30", "2023-04-30"],
    ["2022-06-30", "2023-06-30"],
    ["2022-06-30", "2023-09-30"],
    ["2022-06-30", "2023-11-30"],
    ["2022-06-30", "2024-02-29"],
    ["2022-07-31", "2023-02-28"],
    ["2022-07-31", "2023-04-30"],
    ["2022-07-31", "2023-06-30"],
    ["2022-07-31", "2023-09-30"],
    ["2022-07-31", "2023-11-30"],
    ["2022-07-31", "2024-02-29"],
    ["2022-08-31", "2023-02-28"],
    ["2022-08-31", "2023-04-30"],
    ["2022-08-31", "2023-06-30"],
    ["2022-08-31", "2023-09-30"],
    ["2022-08-31", "2023-11-30"],
    ["2022-08-31", "2024-02-29"],
    ["2022-09-30", "2023-02-28"],
    ["2022-09-30", "2023-04-30"],
    ["2022-09-30", "2023-06-30"],
    ["2022-09-30", "2023-09-30"],
    ["2022-09-30", "2023-11-30"],
    ["2022-09-30", "2024-02-29"],
    ["2022-10-31", "2023-02-28"],
    ["2022-10-31", "2023-04-30"],
    ["2022-10-31", "2023-06-30"],
    ["2022-10-31", "2023-09-30"],
    ["2022-10-31", "2023-11-30"],
    ["2022-10-31", "2024-02-29"],
    ["2022-11-30", "2023-02-28"],
    ["2022-11-30", "2023-04-30"],
    ["2022-11-30", "2023-06-30"],
    ["2022-11-30", "2023-09-30"],
    ["2022-11-30", "2023-11-30"],
    ["2022-11-30", "2024-02-29"],
    ["2022-12-31", "2023-02-28"],
    ["2022-12-31", "2023-04-30"],
    ["2022-12-31", "2023-06-30"],
    ["2022-12-31", "2023-09-30"],
    ["2022-12-31", "2023-11-30"],
    ["2022-12-31", "2024-02-29"],
  ])(
    "returns task when task recurs monthly on day starting on %s and today is %s",
    async (start, today) => {
      const user = await createTestUser("America/Los_Angeles");
      const now = parseISO(`${today}T08:00:00Z`);
      const taskForm: TaskForm = {
        id: uid(),
        name: faker.lorem.words(),
        recurrence: { start, type: "day_of_month" as const, step: 1 },
      };
      await services.createTask(taskForm, user);

      await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
        id: taskForm.id,
        name: taskForm.name,
        note: null,
      });
    },
  );
  test("returns nullish when task recurs monthly on day starting on last day of month and today is 28 Feb in leap year", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2024-02-28T08:00:00Z");
    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: {
        start: "2023-01-31",
        type: "day_of_month" as const,
        step: 1,
      },
    };
    await services.createTask(taskForm, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();
  });
  test.each([
    ["2024-09-01", "2024-11-03"],
    ["2024-09-01", "2024-10-06"],
    ["2024-12-24", "2025-01-28"],
  ])(
    "returns task when task recurs monthly on week starting on %s and today is %s",
    async (start, today) => {
      const user = await createTestUser("America/Los_Angeles");
      const now = parseISO(`${today}T08:00:00Z`);
      const taskForm: TaskForm = {
        id: uid(),
        name: faker.lorem.words(),
        recurrence: { start, type: "week_of_month" as const, step: 1 },
      };
      await services.createTask(taskForm, user);

      await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
        id: taskForm.id,
        name: taskForm.name,
        note: null,
      });
    },
  );
  test("returns nullish when task recurs monthly on week and today does not match month, week, and day of week", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2024-11-03T08:00:00Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: {
        start: "2024-09-01",
        type: "week_of_month" as const,
        step: 3,
      },
    };
    await services.createTask(taskForm1, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: {
        start: "2024-09-08",
        type: "week_of_month" as const,
        step: 1,
      },
    };
    await services.createTask(taskForm2, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: {
        start: "2024-09-03",
        type: "week_of_month" as const,
        step: 1,
      },
    };
    await services.createTask(taskForm3, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();
  });
  test.each([
    ["2020-01-31", "2023-01-31"],
    ["2020-02-29", "2023-02-28"],
    ["2021-02-28", "2023-02-28"],
  ])(
    "returns task when task recurs yearly starting on %s and today is %s",
    async (start, today) => {
      const user = await createTestUser("America/Los_Angeles");
      const now = parseISO(`${today}T08:00:00Z`);
      const taskForm: TaskForm = {
        id: uid(),
        name: faker.lorem.words(),
        recurrence: { start, type: "year" as const, step: 1 },
      };
      await services.createTask(taskForm, user);

      await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
        id: taskForm.id,
        name: taskForm.name,
        note: null,
      });
    },
  );
  test("returns nullish when task recurs yearly starting on leap day and today is 28 Feb on leap year", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2024-02-28T08:00:00Z");
    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2020-02-29", type: "year" as const, step: 1 },
    };
    await services.createTask(taskForm, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();
  });
  test("returns nullish when task recurrence starts after today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-24", type: "day" as const, step: 1 },
    };
    await services.createTask(taskForm, user);

    await expect(
      services.getCurrentTask(user, parseISO("2025-01-23T08:00:00Z")),
    ).resolves.toBeNil();
  });
  test("returns child of parent not recurring today", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2025-01-23T08:00:00Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 2 },
    };
    await services.createTask(taskForm1, user);

    await expect(services.getCurrentTask(user, now)).resolves.toBeNil();

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    await services.createTask(taskForm2, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });
  });
  test("orders tasks by priorities", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2025-01-24T07:59:59Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm1, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
    });

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm2, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
    });

    await services.updateTask(
      {
        id: taskForm1.id,
        name: taskForm1.name,
        parent: { id: taskForm2.id, name: taskForm2.name },
      },
      user,
    );

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      deadline: {
        time: "23:58",
      },
    };
    await services.createTask(taskForm3, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm3.id,
      name: taskForm3.name,
      note: null,
    });

    const taskForm4: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      deadline: {
        date: "2025-01-23",
      },
    };
    await services.createTask(taskForm4, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm4.id,
      name: taskForm4.name,
      note: null,
    });

    await services.updateTask(
      { ...taskForm4, parent: { id: taskForm3.id, name: taskForm3.name } },
      user,
    );

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm3.id,
      name: taskForm3.name,
      note: null,
    });

    await services.updateTask(
      {
        id: taskForm1.id,
        name: taskForm1.name,
        deadline: {
          date: "2025-01-22",
          time: "23:59",
        },
        parent: { id: taskForm2.id, name: taskForm2.name },
      },
      user,
    );

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });

    await services.updateTask(
      {
        id: taskForm4.id,
        name: taskForm4.name,
        recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
        parent: { id: taskForm3.id, name: taskForm3.name },
      },
      user,
    );

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm3.id,
      name: taskForm3.name,
      note: null,
    });

    await services.updateTask(
      {
        id: taskForm1.id,
        name: taskForm1.name,
        recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
        deadline: {
          time: "23:58",
        },
        parent: { id: taskForm2.id, name: taskForm2.name },
      },
      user,
    );

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });

    await services.updateTask(
      {
        id: taskForm4.id,
        name: taskForm4.name,
        scheduledAt: {
          date: "2025-01-23",
          time: "23:58",
        },
        parent: { id: taskForm3.id, name: taskForm3.name },
      },
      user,
    );

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm3.id,
      name: taskForm3.name,
      note: null,
    });

    await services.updateTask(
      {
        id: taskForm2.id,
        name: taskForm2.name,
        scheduledAt: {
          date: "2025-01-23",
          time: "23:59",
        },
      },
      user,
    );

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
    });
  });
  test("does not order task by descendant not recurring today", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2025-01-23T08:00:00Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm1, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
    });

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 2 },
      deadline: {
        time: "00:00",
      },
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    await services.createTask(taskForm2, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
    });

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      deadline: {
        time: "23:59",
      },
    };
    await services.createTask(taskForm3, user);

    await expect(services.getCurrentTask(user, now)).resolves.toStrictEqual({
      id: taskForm3.id,
      name: taskForm3.name,
      note: null,
    });
  });
});

describe("searchTasks", () => {
  test("returns tasks matching query", async () => {
    const [query, ...names] = faker.helpers.uniqueArray(
      () => faker.lorem.word(),
      6,
    );
    const user = await createTestUser("America/Los_Angeles");

    const taskForm1: TaskForm = {
      id: uid(),
      name: `${query} ${names[0]}`,
    };
    const taskId1 = (await services.createTask(taskForm1, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId1, doneAt: parseISO("2025-01-22T08:00:00Z") });

    const taskForm2: TaskForm = {
      id: uid(),
      name: `${query} ${names[1]}`,
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
    };
    const taskId2 = (await services.createTask(taskForm2, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId2, doneAt: parseISO("2025-01-22T08:00:00Z") });

    const taskForm3: TaskForm = {
      id: uid(),
      name: `${query} ${names[2]}`,
    };
    await services.createTask(taskForm3, user);

    const taskForm4: TaskForm = {
      id: uid(),
      name: `${query} ${names[3]}`,
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
    };
    await services.createTask(taskForm4, user);

    const taskForm5: TaskForm = {
      id: uid(),
      name: names[4]!,
    };
    await services.createTask(taskForm5, user);

    const [results1, nextCursor1] = await services.searchTasks({
      query: query!,
      user,
      cursor: null,
      now: parseISO("2025-01-22T08:00:00Z"),
    });

    expect(
      results1.map(({ id, name, isDone }) => ({ id, name, isDone })),
    ).toIncludeSameMembers([
      { id: taskForm1.id, name: taskForm1.name, isDone: true },
      { id: taskForm2.id, name: taskForm2.name, isDone: true },
      { id: taskForm3.id, name: taskForm3.name, isDone: false },
      { id: taskForm4.id, name: taskForm4.name, isDone: false },
    ]);
    expect(nextCursor1).toBeNil();

    const [results2, nextCursor2] = await services.searchTasks({
      query: query!,
      user,
      cursor: null,
      now: parseISO("2025-01-23T08:00:00Z"),
    });

    expect(
      results2.map(({ id, name, isDone }) => ({ id, name, isDone })),
    ).toIncludeSameMembers([
      { id: taskForm1.id, name: taskForm1.name, isDone: true },
      { id: taskForm2.id, name: taskForm2.name, isDone: false },
      { id: taskForm3.id, name: taskForm3.name, isDone: false },
      { id: taskForm4.id, name: taskForm4.name, isDone: false },
    ]);
    expect(nextCursor2).toBeNil();
  });
});

describe("getTaskDetail", () => {
  test("returns completion state of task", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId1 = (await services.createTask(taskForm1, user))!;

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-23", type: "day" as const, step: 1 },
    };
    const taskId2 = (await services.createTask(taskForm2, user))!;

    await expect(
      services.getTaskDetail(
        taskForm1.id,
        user,
        parseISO("2025-01-22T08:00:00Z"),
      ),
    ).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
      recurrence: null,
      deadline: null,
      startAfter: null,
      scheduledAt: null,
      isDone: false,
      parent: null,
      children: [],
    });
    await expect(
      services.getTaskDetail(
        taskForm2.id,
        user,
        parseISO("2025-01-22T08:00:00Z"),
      ),
    ).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
      recurrence: "Daily",
      deadline: null,
      startAfter: null,
      scheduledAt: null,
      isDone: false,
      parent: null,
      children: [],
    });

    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId1, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      services.getTaskDetail(
        taskForm1.id,
        user,
        parseISO("2025-01-22T08:00:00Z"),
      ),
    ).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
      recurrence: null,
      deadline: null,
      startAfter: null,
      scheduledAt: null,
      isDone: true,
      parent: null,
      children: [],
    });
    await expect(
      services.getTaskDetail(
        taskForm1.id,
        user,
        parseISO("2025-01-23T08:00:00Z"),
      ),
    ).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
      recurrence: null,
      deadline: null,
      startAfter: null,
      scheduledAt: null,
      isDone: true,
      parent: null,
      children: [],
    });

    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId2, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      services.getTaskDetail(
        taskForm2.id,
        user,
        parseISO("2025-01-22T08:00:00Z"),
      ),
    ).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
      recurrence: "Daily",
      deadline: null,
      startAfter: null,
      scheduledAt: null,
      isDone: true,
      parent: null,
      children: [],
    });
    await expect(
      services.getTaskDetail(
        taskForm2.id,
        user,
        parseISO("2025-01-23T08:00:00Z"),
      ),
    ).resolves.toStrictEqual({
      id: taskForm2.id,
      name: taskForm2.name,
      note: null,
      recurrence: "Daily",
      deadline: null,
      startAfter: null,
      scheduledAt: null,
      isDone: false,
      parent: null,
      children: [],
    });
  });
  test("orders children by isDone", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm1, user);

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    const taskId2 = (await services.createTask(taskForm2, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId2, doneAt: parseISO("2025-01-22T08:00:00Z") });

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    const taskId3 = (await services.createTask(taskForm3, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId3, doneAt: parseISO("2025-01-23T08:00:00Z") });

    const taskForm4: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    const taskId4 = (await services.createTask(taskForm4, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId: taskId4, doneAt: parseISO("2025-01-22T08:00:00Z") });

    const taskForm5: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    await services.createTask(taskForm5, user);

    const taskForm6: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    await services.createTask(taskForm6, user);

    await expect(
      services.getTaskDetail(
        taskForm1.id,
        user,
        parseISO("2025-01-23T08:00:00Z"),
      ),
    ).resolves.toStrictEqual({
      id: taskForm1.id,
      name: taskForm1.name,
      note: null,
      recurrence: null,
      deadline: null,
      startAfter: null,
      scheduledAt: null,
      isDone: false,
      parent: null,
      children: [
        { id: taskForm2.id, name: taskForm2.name, isDone: false },
        { id: taskForm6.id, name: taskForm6.name, isDone: false },
        { id: taskForm5.id, name: taskForm5.name, isDone: false },
        { id: taskForm3.id, name: taskForm3.name, isDone: true },
        { id: taskForm4.id, name: taskForm4.name, isDone: true },
      ],
    });
  });
});

describe("createTask", () => {
  test("connects task paths", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId1 = (await services.createTask(taskForm1, user))!;

    await expect(
      db
        .select({
          ancestor: table.taskPath.ancestor,
          descendant: table.taskPath.descendant,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .where(
          or(
            eq(table.taskPath.ancestor, taskId1),
            eq(table.taskPath.descendant, taskId1),
          ),
        )
        .orderBy(
          table.taskPath.depth,
          table.taskPath.ancestor,
          table.taskPath.descendant,
        ),
    ).resolves.toStrictEqual([
      { ancestor: taskId1, descendant: taskId1, depth: 0 },
    ]);

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    const taskId2 = (await services.createTask(taskForm2, user))!;

    await expect(
      db
        .select({
          ancestor: table.taskPath.ancestor,
          descendant: table.taskPath.descendant,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .where(
          or(
            inArray(table.taskPath.ancestor, [taskId1, taskId2]),
            inArray(table.taskPath.descendant, [taskId1, taskId2]),
          ),
        )
        .orderBy(
          table.taskPath.depth,
          table.taskPath.ancestor,
          table.taskPath.descendant,
        ),
    ).resolves.toStrictEqual([
      { ancestor: taskId1, descendant: taskId1, depth: 0 },
      { ancestor: taskId2, descendant: taskId2, depth: 0 },
      { ancestor: taskId1, descendant: taskId2, depth: 1 },
    ]);

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm2.id, name: taskForm2.name },
    };
    const taskId3 = (await services.createTask(taskForm3, user))!;

    await expect(
      db
        .select({
          ancestor: table.taskPath.ancestor,
          descendant: table.taskPath.descendant,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .where(
          or(
            inArray(table.taskPath.ancestor, [taskId1, taskId2, taskId3]),
            inArray(table.taskPath.descendant, [taskId1, taskId2, taskId3]),
          ),
        )
        .orderBy(
          table.taskPath.depth,
          table.taskPath.ancestor,
          table.taskPath.descendant,
        ),
    ).resolves.toStrictEqual([
      { ancestor: taskId1, descendant: taskId1, depth: 0 },
      { ancestor: taskId2, descendant: taskId2, depth: 0 },
      { ancestor: taskId3, descendant: taskId3, depth: 0 },
      { ancestor: taskId1, descendant: taskId2, depth: 1 },
      { ancestor: taskId2, descendant: taskId3, depth: 1 },
      { ancestor: taskId1, descendant: taskId3, depth: 2 },
    ]);

    const taskForm4: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    const taskId4 = (await services.createTask(taskForm4, user))!;

    await expect(
      db
        .select({
          ancestor: table.taskPath.ancestor,
          descendant: table.taskPath.descendant,
          depth: table.taskPath.depth,
        })
        .from(table.taskPath)
        .where(
          or(
            inArray(table.taskPath.ancestor, [
              taskId1,
              taskId2,
              taskId3,
              taskId4,
            ]),
            inArray(table.taskPath.descendant, [
              taskId1,
              taskId2,
              taskId3,
              taskId4,
            ]),
          ),
        )
        .orderBy(
          table.taskPath.depth,
          table.taskPath.ancestor,
          table.taskPath.descendant,
        ),
    ).resolves.toStrictEqual([
      { ancestor: taskId1, descendant: taskId1, depth: 0 },
      { ancestor: taskId2, descendant: taskId2, depth: 0 },
      { ancestor: taskId3, descendant: taskId3, depth: 0 },
      { ancestor: taskId4, descendant: taskId4, depth: 0 },
      { ancestor: taskId1, descendant: taskId2, depth: 1 },
      { ancestor: taskId1, descendant: taskId4, depth: 1 },
      { ancestor: taskId2, descendant: taskId3, depth: 1 },
      { ancestor: taskId1, descendant: taskId3, depth: 2 },
    ]);
  });
});

describe("updateTask", () => {
  test("connects task paths", async () => {
    const user = await createTestUser("America/Los_Angeles");
    const now = parseISO("2025-01-23T08:00:00Z");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm1, user);

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    await services.createTask(taskForm2, user);

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm2.id, name: taskForm2.name },
    };
    await services.createTask(taskForm3, user);

    await expect(
      services.getTaskDetail(taskForm1.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      parent: null,
      children: [{ id: taskForm2.id, name: taskForm2.name, isDone: false }],
    });
    await expect(
      services.getTaskDetail(taskForm2.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm2.id,
      parent: { id: taskForm1.id, name: taskForm1.name, isDone: false },
      children: [{ id: taskForm3.id, name: taskForm3.name, isDone: false }],
    });
    await expect(
      services.getTaskDetail(taskForm3.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: { id: taskForm2.id, name: taskForm2.name, isDone: false },
      children: [],
    });

    await services.updateTask(
      { ...taskForm1, parent: { id: taskForm3.id, name: taskForm3.name } },
      user,
    );

    await expect(
      services.getTaskDetail(taskForm1.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      parent: { id: taskForm3.id, name: taskForm3.name, isDone: false },
      children: [],
    });
    await expect(
      services.getTaskDetail(taskForm2.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm2.id,
      parent: null,
      children: [{ id: taskForm3.id, name: taskForm3.name, isDone: false }],
    });
    await expect(
      services.getTaskDetail(taskForm3.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: { id: taskForm2.id, name: taskForm2.name, isDone: false },
      children: [{ id: taskForm1.id, name: taskForm1.name, isDone: false }],
    });

    await services.updateTask(
      {
        ...taskForm1,
        deadline: {
          date: "2025-01-24",
        },
        parent: { id: taskForm3.id, name: taskForm3.name },
      },
      user,
    );

    await expect(
      services.getTaskDetail(taskForm1.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      deadline: {
        iso: "2025-01-24",
        human: "Friday, January 24, 2025",
      },
      parent: { id: taskForm3.id, name: taskForm3.name, isDone: false },
      children: [],
    });
    await expect(
      services.getTaskDetail(taskForm2.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm2.id,
      parent: null,
      children: [{ id: taskForm3.id, name: taskForm3.name, isDone: false }],
    });
    await expect(
      services.getTaskDetail(taskForm3.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: { id: taskForm2.id, name: taskForm2.name, isDone: false },
      children: [{ id: taskForm1.id, name: taskForm1.name, isDone: false }],
    });

    await services.updateTask(
      {
        id: taskForm2.id,
        name: taskForm2.name,
        startAfter: {
          time: "00:01",
        },
      },
      user,
    );

    await expect(
      services.getTaskDetail(taskForm1.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      parent: { id: taskForm3.id, name: taskForm3.name, isDone: false },
      children: [],
    });
    await expect(
      services.getTaskDetail(taskForm2.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm2.id,
      startAfter: {
        iso: "00:01:00",
        human: "12:01 AM",
      },
      parent: null,
      children: [{ id: taskForm3.id, name: taskForm3.name, isDone: false }],
    });
    await expect(
      services.getTaskDetail(taskForm3.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: { id: taskForm2.id, name: taskForm2.name, isDone: false },
      children: [{ id: taskForm1.id, name: taskForm1.name, isDone: false }],
    });

    await services.updateTask(
      {
        id: taskForm3.id,
        name: taskForm3.name,
      },
      user,
    );

    await expect(
      services.getTaskDetail(taskForm1.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      parent: { id: taskForm3.id, name: taskForm3.name, isDone: false },
      children: [],
    });
    await expect(
      services.getTaskDetail(taskForm2.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm2.id,
      parent: null,
      children: [],
    });
    await expect(
      services.getTaskDetail(taskForm3.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: null,
      children: [{ id: taskForm1.id, name: taskForm1.name, isDone: false }],
    });

    await services.updateTask(
      {
        id: taskForm2.id,
        name: taskForm2.name,
        parent: { id: taskForm3.id, name: taskForm3.name },
      },
      user,
    );

    await expect(
      services.getTaskDetail(taskForm1.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      parent: { id: taskForm3.id, name: taskForm3.name, isDone: false },
      children: [],
    });
    await expect(
      services.getTaskDetail(taskForm2.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm2.id,
      parent: { id: taskForm3.id, name: taskForm3.name, isDone: false },
      children: [],
    });
    await expect(
      services.getTaskDetail(taskForm3.id, user, now),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: null,
      children: [
        { id: taskForm1.id, name: taskForm1.name, isDone: false },
        { id: taskForm2.id, name: taskForm2.name, isDone: false },
      ],
    });
  });
});

describe("deleteTask", () => {
  test("decrements depth between parent and children", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm1: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    await services.createTask(taskForm1, user);

    const taskForm2: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm1.id, name: taskForm1.name },
    };
    await services.createTask(taskForm2, user);

    const taskForm3: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      parent: { id: taskForm2.id, name: taskForm2.name },
    };
    await services.createTask(taskForm3, user);

    await expect(
      services.getTaskDetail(taskForm1.id, user),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      parent: null,
      children: [{ id: taskForm2.id, name: taskForm2.name, isDone: false }],
    });
    await expect(
      services.getTaskDetail(taskForm2.id, user),
    ).resolves.toMatchObject({
      id: taskForm2.id,
      parent: { id: taskForm1.id, name: taskForm1.name, isDone: false },
      children: [{ id: taskForm3.id, name: taskForm3.name, isDone: false }],
    });
    await expect(
      services.getTaskDetail(taskForm3.id, user),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: { id: taskForm2.id, name: taskForm2.name, isDone: false },
      children: [],
    });

    await services.deleteTask(taskForm2.id, user.id);

    await expect(
      services.getTaskDetail(taskForm1.id, user),
    ).resolves.toMatchObject({
      id: taskForm1.id,
      parent: null,
      children: [{ id: taskForm3.id, name: taskForm3.name, isDone: false }],
    });
    await expect(services.getTaskDetail(taskForm2.id, user)).resolves.toBeNil();
    await expect(
      services.getTaskDetail(taskForm3.id, user),
    ).resolves.toMatchObject({
      id: taskForm3.id,
      parent: { id: taskForm1.id, name: taskForm1.name, isDone: false },
      children: [],
    });
  });
});

describe("markTaskDone", () => {
  test("creates task completion when non-recurring task not done", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId = (await services.createTask(taskForm, user))!;

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(0);

    await services.markTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);
  });
  test("does nothing when non-recurring task done before today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);

    await services.markTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);
  });
  test("does nothing when non-recurring task done today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-23T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);

    await services.markTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);
  });
  test("creates task completion when recurring task not done", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
    };
    const taskId = (await services.createTask(taskForm, user))!;

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(0);

    await services.markTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);
  });
  test("creates task completion when recurring task done before today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);

    await services.markTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(2);
  });
  test("does nothing when recurring task done today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-23T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);

    await services.markTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);
  });
});

describe("unmarkTaskDone", () => {
  test("deletes task completion when non-recurring task done today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-23T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);

    await services.unmarkTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(0);
  });
  test("deletes task completion when non-recurring task done before today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);

    await services.unmarkTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(0);
  });
  test("deletes last task completion when recurring task done today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-22T08:00:00Z") });
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-23T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(2);

    await services.unmarkTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db
        .select({ doneAt: table.taskCompletion.doneAt })
        .from(table.taskCompletion)
        .where(eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toStrictEqual([{ doneAt: parseISO("2025-01-22T08:00:00Z") }]);
  });
  test("does nothing when recurring task done before today", async () => {
    const user = await createTestUser("America/Los_Angeles");

    const taskForm: TaskForm = {
      id: uid(),
      name: faker.lorem.words(),
      recurrence: { start: "2025-01-22", type: "day" as const, step: 1 },
    };
    const taskId = (await services.createTask(taskForm, user))!;
    await db
      .insert(table.taskCompletion)
      .values({ taskId, doneAt: parseISO("2025-01-22T08:00:00Z") });

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);

    await services.unmarkTaskDone(
      taskForm.id,
      user,
      parseISO("2025-01-23T08:00:00Z"),
    );

    await expect(
      db.$count(table.taskCompletion, eq(table.taskCompletion.taskId, taskId)),
    ).resolves.toBe(1);
  });
});

async function createTestUser(timeZone: string) {
  const [user] = await db
    .insert(table.user)
    .values({
      clientId: uid(),
      googleId: faker.string.uuid(),
      email: faker.internet.email(),
    })
    .returning({ id: table.user.id });
  return { id: user!.id, timeZone };
}

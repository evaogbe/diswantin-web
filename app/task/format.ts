import { addDays, parse } from "date-fns";
import { toDate } from "date-fns-tz";
import { weekdaysToIndices } from "./model";
import type { TaskRecurrence } from "./model";

const suffixes = new Map([
  ["one", "st"],
  ["two", "nd"],
  ["few", "rd"],
  ["other", "th"],
]);

function formatOrdinal(n: number) {
  const pr = new Intl.PluralRules("en-US", { type: "ordinal" });
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
}

export function formatRecurrence(recurrence: TaskRecurrence, timeZone: string) {
  if ("weekdays" in recurrence) {
    const start = toDate(`${recurrence.start}T00:00:00`, { timeZone });
    const dates = recurrence.weekdays
      .map((weekday) =>
        addDays(start, 7 + weekdaysToIndices[weekday] - start.getDay()),
      )
      .sort((a, b) => (a.getDay() < b.getDay() ? -1 : 1));
    const weekdayDtf = new Intl.DateTimeFormat("en-US", {
      weekday:
        recurrence.weekdays.length > 3
          ? "narrow"
          : recurrence.weekdays.length > 1
            ? "short"
            : "long",
      timeZone,
    });
    const weekdaysStr = new Intl.ListFormat("en-US", {
      style: "long",
      type: "conjunction",
    }).format(dates.map((weekday) => weekdayDtf.format(weekday)));
    return recurrence.step === 1
      ? `Weekly on ${weekdaysStr}`
      : `Every ${recurrence.step} weeks on ${weekdaysStr}`;
  } else {
    switch (recurrence.type) {
      case "day":
        return recurrence.step === 1
          ? "Daily"
          : `Every ${recurrence.step} days`;
      case "day_of_month": {
        const start = toDate(`${recurrence.start}T00:00:00`, { timeZone });
        const date = formatOrdinal(start.getDate());
        return recurrence.step === 1
          ? `Monthly on the ${date}`
          : `Every ${recurrence.step} months on the ${date}`;
      }
      case "week_of_month": {
        const start = toDate(`${recurrence.start}T00:00:00`, { timeZone });
        const week = Math.ceil(start.getDate() / 7);
        const weekday = new Intl.DateTimeFormat("en-US", {
          weekday: "long",
          timeZone,
        }).format(start);
        return recurrence.step === 1
          ? `Monthly on the ${formatOrdinal(week)} ${weekday}`
          : `Every ${recurrence.step} months on the ${formatOrdinal(week)} ${weekday}`;
      }
      case "year": {
        const start = toDate(`${recurrence.start}T00:00:00`, { timeZone });
        const monthDay = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          timeZone,
        }).format(start);
        return recurrence.step === 1
          ? `Yearly on ${monthDay}`
          : `Every ${recurrence.step} years on ${monthDay}`;
      }
    }
  }
}

export function formatDateTime(
  date: string | null,
  time: string | null,
  timeZone: string,
) {
  if (date != null && time != null) {
    const dateTime = toDate(`${date}T${time}`, { timeZone });
    return {
      iso: dateTime.toISOString(),
      human: new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone,
      }).format(dateTime),
    };
  }

  if (date != null) {
    const dateTime = toDate(`${date}T00:00:00`, { timeZone });
    return {
      iso: dateTime.toISOString(),
      human: new Intl.DateTimeFormat("en-US", {
        dateStyle: "full",
        timeZone,
      }).format(dateTime),
    };
  }

  if (time != null) {
    const dateTime = parse(time, "HH:mm:ss", new Date());
    return {
      iso: dateTime.toISOString(),
      human: new Intl.DateTimeFormat("en-US", {
        timeStyle: "short",
      }).format(dateTime),
    };
  }

  return null;
}

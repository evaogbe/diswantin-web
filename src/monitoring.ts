import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: process.env.SENTRY_DNS,
  tracesSampleRate: 1,
  autoInstrumentRemix: true,
});

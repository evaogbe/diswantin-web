import * as Sentry from "@sentry/react";

export function initMonitoring() {
  Sentry.init({
    dsn: window.ENV.SENTRY_DSN,
    tracesSampleRate: 1,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    tunnel: "/monitoring",
  });
}

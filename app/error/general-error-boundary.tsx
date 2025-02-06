import * as Sentry from "@sentry/react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { NotFoundPage } from "./not-found-page";
import { Page, PageHeading } from "~/layout/page";

export function GeneralErrorBoundary({
  isAuthenticated,
}: { isAuthenticated?: boolean } = {}) {
  const error = useRouteError();
  if (!isRouteErrorResponse(error) && error instanceof Error) {
    Sentry.captureException(error);
  }

  switch (isRouteErrorResponse(error) ? error.status : 500) {
    case 400: {
      return (
        <Page
          aria-labelledby="incorrect-input-heading"
          className="space-y-fl-sm"
        >
          <PageHeading id="incorrect-input-heading">
            Incorrect input
          </PageHeading>
          <p className="leading-7 break-words">
            Your browser sent something we don&apos;t understand
          </p>
        </Page>
      );
    }
    case 403: {
      return (
        <Page aria-labelledby="access-denied-heading" className="space-y-fl-sm">
          <PageHeading id="access-denied-heading">Access denied</PageHeading>
          <p className="leading-7 break-words">
            You are not allowed to do that
          </p>
        </Page>
      );
    }
    case 404: {
      return <NotFoundPage homePath={isAuthenticated ? "/home" : "/"} />;
    }
    case 429: {
      return (
        <Page
          aria-labelledby="too-many-requests-heading"
          className="space-y-fl-sm"
        >
          <PageHeading id="too-many-requests-heading">
            Rate limit exceeded
          </PageHeading>
          <p className="leading-7 break-words">
            Please wait a few moments then try again
          </p>
        </Page>
      );
    }
    default: {
      return (
        <Page
          aria-labelledby="unexpected-error-heading"
          className="space-y-fl-sm"
        >
          <PageHeading id="unexpected-error-heading">
            Unexpected error
          </PageHeading>
          <p className="leading-7 break-words">
            We&apos;re experiencing unexpected technical difficulties. Please
            try again later. Thank you for your patience.
          </p>
        </Page>
      );
    }
  }
}

import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { captureRemixErrorBoundaryError } from "@sentry/remix";
import { NotFoundPage } from "./not-found-page";
import { Page, PageHeading } from "~/layout/page";

export function GeneralErrorBoundary({
  isAuthenticated,
}: { isAuthenticated?: boolean } = {}) {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  switch (isRouteErrorResponse(error) ? error.status : 500) {
    case 400: {
      return (
        <Page aria-labelledby="incorrect-input-heading">
          <PageHeading id="incorrect-input-heading">
            Incorrect input
          </PageHeading>
          <p className="mt-sm leading-7">
            Your browser sent something we don&apos;t understand
          </p>
        </Page>
      );
    }
    case 403: {
      return (
        <Page aria-labelledby="access-denied-heading">
          <PageHeading id="access-denied-heading">Access denied</PageHeading>
          <p className="mt-sm leading-7">You are not allowed to do that</p>
        </Page>
      );
    }
    case 404: {
      return <NotFoundPage homePath={isAuthenticated ? "/home" : "/"} />;
    }
    case 429: {
      return (
        <Page aria-labelledby="too-many-requests-heading">
          <PageHeading id="too-many-requests-heading">
            Rate limit exceeded
          </PageHeading>
          <p className="mt-sm leading-7">
            Please wait a few moments then try again
          </p>
        </Page>
      );
    }
    default: {
      return (
        <Page aria-labelledby="unexpected-error-heading">
          <PageHeading id="unexpected-error-heading">
            Unexpected error
          </PageHeading>
          <p className="mt-sm leading-7">
            We&apos;re experiencing unexpected technical difficulties. Please
            try again later. Thank you for your patience.
          </p>
        </Page>
      );
    }
  }
}

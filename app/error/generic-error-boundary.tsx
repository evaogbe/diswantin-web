import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { captureRemixErrorBoundaryError } from "@sentry/remix";

export function GenericErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  switch (isRouteErrorResponse(error) ? error.status : 500) {
    case 400: {
      return (
        <article aria-labelledby="incorrect-input-heading">
          <h2 id="incorrect-input-heading">Incorrect input</h2>
          <p>Your browser sent something we don&apos;t understand</p>
        </article>
      );
    }
    case 403: {
      return (
        <article aria-labelledby="access-denied-heading">
          <h2 id="access-denied-heading">Access denied</h2>
          <p>You are not allowed to do that</p>
        </article>
      );
    }
    default: {
      return (
        <article aria-labelledby="unexpected-error-heading">
          <h2 id="unexpected-error-heading">Unexpected error</h2>
          <p>
            We&apos;re experiencing unexpected technical difficulties. Please
            try again later. Thank you for your patience.
          </p>
        </article>
      );
    }
  }
}

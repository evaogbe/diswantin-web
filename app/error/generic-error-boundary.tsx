import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { captureRemixErrorBoundaryError } from "@sentry/remix";

export function GenericErrorBoundary() {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);

  switch (isRouteErrorResponse(error) ? error.status : 500) {
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

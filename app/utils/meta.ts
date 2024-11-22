import { isRouteErrorResponse } from "@remix-run/react";

export function getTitle({ page, error }: { page?: string; error?: unknown }) {
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 403:
        return "Access denied | Diswantin";
      default:
        return "Unexpected error | Diswantin";
    }
  }

  if (error != null) {
    return "Unexpected error | Diswantin";
  }

  if (page != null) {
    return `${page} | Diswantin`;
  }

  return "Diswantin";
}

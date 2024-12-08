import { isRouteErrorResponse } from "@remix-run/react";

export function getTitle({ page, error }: { page?: string; error?: unknown }) {
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 400:
        return "Incorrect input | Diswantin";
      case 403:
        return "Access denied | Diswantin";
      case 404:
        return "Page not found | Diswantin";
      case 429:
        return "Rate limit exceeded | Diswantin";
      default:
        return "Unexpected error | Diswantin";
    }
  }

  if (error != null) {
    return "Unexpected error | Diswantin";
  }

  if (page != null) {
    const truncated = page.length > 45 ? `${page.slice(0, 45)}…` : page;
    return `${truncated} | Diswantin`;
  }

  return "Diswantin";
}

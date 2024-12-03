import { index, layout, route } from "@remix-run/route-config";
import type { RouteConfig } from "@remix-run/route-config";

export default [
  index("auth/sign-in.route.tsx"),
  route("_health", "health/route.ts"),
  route("monitoring", "monitoring/route.ts"),
  route("resources/theme", "theme/route.ts"),
  route("auth/google/callback", "auth/google.route.ts"),
  layout("auth/layout.route.tsx", [
    route("home", "task/current-task.route.tsx"),
    route("new-todo", "task/new-task.route.tsx"),
    route("settings", "auth/settings.route.tsx"),
  ]),
  route("*", "error/not-found.route.tsx"),
] satisfies RouteConfig;

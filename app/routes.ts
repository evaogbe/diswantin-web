import { index, layout, route } from "@remix-run/route-config";
import type { RouteConfig } from "@remix-run/route-config";

export default [
  index("auth/sign-in.route.tsx"),
  route("_health", "health/route.tsx"),
  route("monitoring", "monitoring/route.tsx"),
  route("auth/google/callback", "auth/google.route.tsx"),
  layout("auth/layout.route.tsx", [
    route("home", "task/current-task.route.tsx"),
    route("new-todo", "task/new-task.route.tsx"),
    route("settings", "auth/settings.route.tsx"),
  ]),
  route("*", "error/not-found.route.tsx"),
] satisfies RouteConfig;

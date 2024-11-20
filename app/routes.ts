import { route, index } from "@remix-run/route-config";
import type { RouteConfig } from "@remix-run/route-config";

export const routes: RouteConfig = [
  index("task/current-task.route.tsx"),
  route("/_health", "health/route.tsx"),
  route("/monitoring", "monitoring/route.tsx"),
  route("/new-todo", "task/new-task.route.tsx"),
];

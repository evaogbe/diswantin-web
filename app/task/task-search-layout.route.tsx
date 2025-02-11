import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  Link as RouteLink,
  Outlet,
  useLocation,
  useSubmit,
  useSearchParams,
} from "react-router";
import { twJoin } from "tailwind-merge";
import { useDebouncedCallback } from "use-debounce";
import type { Route } from "./+types/task-search-layout.route";
import { getAuthenticatedUser } from "~/auth/services.server";
import { GeneralErrorBoundary } from "~/error/general-error-boundary";
import logo from "~/layout/logo.png";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";
import { navigationMenuTriggerStyle } from "~/layout/navigation-menu";
import { ThemeToggle } from "~/theme/theme-toggle";
import { Button } from "~/ui/button";
import { cn } from "~/ui/classes";
import { Link } from "~/ui/link";

export async function loader({ request }: Route.LoaderArgs) {
  await getAuthenticatedUser(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  return {
    query: q?.slice(0, 256) ?? null,
    isAuthenticated: true,
  };
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "To-do search", error }) }];
}

function useSearch(query: string | null) {
  const submit = useSubmit();
  const queryRef = useRef<HTMLInputElement>(null);
  const search = useDebouncedCallback((form: HTMLFormElement) => {
    void submit(form, { replace: query != null });
  });
  useEffect(() => {
    queryRef.current?.focus();
    queryRef.current?.setSelectionRange(-1, -1);
  }, []);
  useEffect(() => {
    if (queryRef.current != null && !search.isPending()) {
      queryRef.current.value = query ?? "";
    }
  }, [query, search]);
  return { queryRef, search };
}

export default function TaskSearchLayoutRoute({
  loaderData,
}: Route.ComponentProps) {
  const { query } = loaderData;
  const location = useLocation();
  const { queryRef, search } = useSearch(query);
  const [searchParams] = useSearchParams();
  const [showSkipNav, setShowSkipNav] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex min-h-svh flex-col">
      <p className={twJoin(!showSkipNav && "sr-only")}>
        <Link
          to={`?${searchParams}#main`}
          onFocus={() => {
            setShowSkipNav(true);
          }}
          onBlur={() => {
            setShowSkipNav(false);
          }}
          onClick={() => {
            setShowSkipNav(false);
            mainRef.current?.focus();
          }}
        >
          Skip to content
        </Link>
      </p>
      <header className="gap-fl-xs border-primary-container bg-primary-container p-fl-2xs dark:border-accent top-0 z-10 flex flex-wrap items-center border-b shadow-sm sm:sticky">
        <h1>
          <RouteLink
            to="/home"
            className={cn(navigationMenuTriggerStyle(), "text-base")}
          >
            <img src={logo} alt="" width="32" height="32" />
            <span className="max-sm:sr-only">Diswantin</span>
          </RouteLink>
        </h1>
        <search className="flex-[calc((20ch-100%)*99)]">
          <Form
            action={location.pathname}
            onChange={(e) => {
              search(e.currentTarget);
            }}
          >
            <p className="h-fl-lg gap-fl-2xs border-input py-fl-3xs ps-fl-xs ring-offset-primary-container focus-within:ring-ring flex items-center rounded-md border shadow-xs transition-colors focus-within:ring-2 focus-within:ring-offset-2">
              <label htmlFor="search-form-query">
                <Search aria-hidden="true" className="size-fl-xs" />
                <span className="sr-only">Search</span>
              </label>
              <input
                type="search"
                id="search-form-query"
                name="q"
                defaultValue={query ?? ""}
                placeholder="Search to-dos…"
                maxLength={256}
                ref={queryRef}
                className="placeholder:text-muted-foreground w-full flex-1 bg-transparent text-base focus-visible:outline-hidden md:text-sm"
              />
              {query != null && query !== "" && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-accent/50"
                >
                  <RouteLink to={location.pathname} replace>
                    <X aria-label="Cancel" />
                  </RouteLink>
                </Button>
              )}
            </p>
          </Form>
        </search>
        <ThemeToggle />
      </header>
      {query != null && query.trim().length > 1 && (
        <main
          id="main"
          ref={mainRef}
          tabIndex={-1}
          className="p-fl-sm focus-visible:ring-ring mx-auto flex w-full max-w-prose flex-1 flex-col transition-colors focus-visible:ring-1 focus-visible:outline-hidden max-sm:min-w-fit"
        >
          <Outlet />
        </main>
      )}
    </div>
  );
}

export function ErrorBoundary({ loaderData }: Route.ErrorBoundaryProps) {
  const isAuthenticated = Boolean(loaderData?.isAuthenticated);

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <GeneralErrorBoundary isAuthenticated={isAuthenticated} />
    </MainLayout>
  );
}

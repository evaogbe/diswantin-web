import { Plus, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, Link, useSubmit } from "react-router";
import { useDebouncedCallback } from "use-debounce";
import type { Route } from "./+types/task-search.route";
import { searchTasks } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { GeneralErrorBoundary } from "~/error/general-error-boundary";
import logo from "~/layout/logo.png";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";
import { navigationMenuTriggerStyle } from "~/layout/navigation-menu";
import { Page, PageHeading } from "~/layout/page";
import { ThemeToggle } from "~/theme/theme-toggle";
import { Button } from "~/ui/button";
import { cn } from "~/ui/classes";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthenticatedUser(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const query = q?.trim();
  if (query == null || query.length <= 1 || query.length > 256) {
    return {
      searchResults: [],
      query: q?.slice(0, 256) ?? null,
      isAuthenticated: true,
    };
  }

  const searchResults = await searchTasks(query, user.id);
  return { searchResults, query: q, isAuthenticated: true };
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

export default function TaskSearchRoute({ loaderData }: Route.ComponentProps) {
  const { query, searchResults } = loaderData;
  const { queryRef, search } = useSearch(query);

  return (
    <div className="flex min-h-svh flex-col">
      <header className="top-0 z-10 flex flex-wrap items-center gap-xs border-b border-primary-container bg-primary-container p-2xs shadow dark:border-accent sm:sticky">
        <h1>
          <Link
            to="/home"
            className={cn(navigationMenuTriggerStyle(), "text-base")}
          >
            <img src={logo} alt="" width="24" height="24" />
            <span className="max-sm:sr-only">Diswantin</span>
          </Link>
        </h1>
        <search className="flex-[calc((20ch-100%)*99)]">
          <Form
            onChange={(e) => {
              search(e.currentTarget);
            }}
          >
            <p className="flex h-lg items-center gap-2xs rounded-md border border-input py-3xs ps-xs shadow-sm ring-offset-primary-container transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <label htmlFor="search-form-query">
                <Search aria-hidden="true" className="size-xs" />
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
                className="w-full flex-1 bg-transparent text-base placeholder:text-muted-foreground focus-visible:outline-none md:text-sm"
              />
              {query != null && query !== "" && (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-accent/50"
                >
                  <Link to="/search" replace>
                    <X aria-label="Cancel" />
                  </Link>
                </Button>
              )}
            </p>
          </Form>
        </search>
        <ThemeToggle />
      </header>
      {query != null && query.trim().length > 1 && (
        <main className="mx-auto flex w-full max-w-prose flex-1 flex-col p-sm">
          <Page aria-labelledby="search-results-heading">
            <PageHeading id="search-results-heading">
              Search results
            </PageHeading>
            {searchResults.length > 0 ? (
              <ul className="space-y-xs">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <Link
                      to={`/todo/${result.id}`}
                      className={cn(
                        "flex w-full rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none max-sm:min-w-max",
                        result.isDone && "line-through",
                      )}
                    >
                      <div className="mx-xs my-2xs inline-flex overflow-hidden">
                        {result.headline.map(({ value, highlight }, i) =>
                          highlight ? (
                            <b
                              key={i}
                              className="flex-none bg-primary/50 font-normal"
                            >
                              {value}
                            </b>
                          ) : (
                            <span
                              key={i}
                              className="flex-none whitespace-pre-wrap"
                            >
                              {value}
                            </span>
                          ),
                        )}
                      </div>
                      {result.isDone && <span className="sr-only">Done</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center">
                <Search
                  aria-hidden="true"
                  className="mt-xs size-2xl text-muted-foreground"
                />
                <p className="mt-sm text-xl text-muted-foreground">
                  No matching to-dos
                </p>
                <p className="mt-sm">
                  <Button asChild>
                    <Link to={`/new-todo?name=${query.trim()}`}>
                      <Plus aria-hidden="true" /> Add to-do
                    </Link>
                  </Button>
                </p>
              </div>
            )}
          </Page>
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

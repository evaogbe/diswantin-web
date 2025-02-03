import { Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  Link,
  useNavigation,
  useSearchParams,
  useSubmit,
} from "react-router";
import { Virtuoso } from "react-virtuoso";
import type { Components } from "react-virtuoso";
import { twJoin } from "tailwind-merge";
import { useDebouncedCallback } from "use-debounce";
import type { Route } from "./+types/task-search.route";
import { buildSearchHeadline } from "./format";
import { searchTasks } from "./services.server";
import type { TaskSearchResult } from "./services.server";
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
import { PendingButton } from "~/ui/pending-button";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthenticatedUser(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const query = q?.trim();

  if (query == null || query.length <= 1 || query.length > 256) {
    return {
      searchResults: [] as TaskSearchResult[],
      query: q?.slice(0, 256) ?? null,
      isAuthenticated: true,
    };
  }

  const pageSize = 50;
  const [cursorRank, cursorId] =
    url.searchParams.get("cursor")?.split(":") ?? [];
  const searchResults = await searchTasks({
    query,
    user,
    cursor:
      cursorRank != null && cursorId != null
        ? { rank: cursorRank, clientId: cursorId }
        : null,
    size: pageSize,
  });
  const lastResult = searchResults[searchResults.length - 1];
  return {
    searchResults,
    nextCursor:
      searchResults.length < pageSize
        ? null
        : `${lastResult?.rank}:${lastResult?.id}`,
    query: q,
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

function usePaginate(page: TaskSearchResult[], isInitial: boolean) {
  const [data, setData] = useState(page);
  useEffect(() => {
    if (isInitial) {
      setData(page);
    } else {
      setData((prev) =>
        page.length > 0 &&
        prev.length > 0 &&
        page[page.length - 1]?.id !== prev[prev.length - 1]?.id
          ? prev.concat(page)
          : prev,
      );
    }
  }, [page, isInitial]);
  return data;
}

type SearchResultComponents = Components<
  TaskSearchResult,
  { query: string; loading: boolean; hasMore: boolean; loadMore: () => void }
>;

// ESLint is not picking up Typescript types from React Virtuoso
/* eslint-disable react/prop-types */
const SearchResultList: SearchResultComponents["List"] = ({
  ref,
  ...props
}) => {
  return (
    <ul
      className="mt-fl-2xs space-y-fl-2xs"
      ref={ref as React.Ref<HTMLUListElement>}
      {...props}
    />
  );
};

const SearchResultItem: SearchResultComponents["Item"] = (props) => {
  return <li {...props} />;
};

const SearchResultFooter: SearchResultComponents["Footer"] = ({ context }) => {
  if (!context?.hasMore) {
    return null;
  }

  return (
    <PendingButton
      pending={context.loading}
      pendingText="Loading…"
      variant="secondary"
      type="button"
      onClick={context.loadMore}
      className="mt-fl-2xs"
    >
      Load more
    </PendingButton>
  );
};

const EmptySearchResultsPlaceholder: SearchResultComponents["EmptyPlaceholder"] =
  ({ context }) => {
    return (
      <div className="flex flex-col items-center">
        <Search
          aria-hidden="true"
          className="mt-fl-xs size-fl-2xl text-muted-foreground"
        />
        <p className="mt-fl-sm text-xl text-muted-foreground">
          No matching to-dos
        </p>
        <p className="mt-fl-sm">
          <Button asChild>
            <Link to={`/new-todo?name=${context?.query.trim()}`}>
              <Plus aria-hidden="true" /> Add to-do
            </Link>
          </Button>
        </p>
      </div>
    );
  };
/* eslint-enable react/prop-types */

export default function TaskSearchRoute({ loaderData }: Route.ComponentProps) {
  const { query, searchResults: searchResultPage, nextCursor } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitial = !searchParams.has("cursor");
  const { queryRef, search } = useSearch(query);
  const searchResults = usePaginate(searchResultPage, isInitial);
  const navigation = useNavigation();
  const tokens = query?.split(/\s+/) ?? [];

  return (
    <div className="flex min-h-svh flex-col">
      <header className="top-0 z-10 flex flex-wrap items-center gap-fl-xs border-b border-primary-container bg-primary-container p-fl-2xs shadow dark:border-accent sm:sticky">
        <h1>
          <Link
            to="/home"
            className={cn(navigationMenuTriggerStyle(), "text-base")}
          >
            <img src={logo} alt="" width="32" height="32" />
            <span className="max-sm:sr-only">Diswantin</span>
          </Link>
        </h1>
        <search className="flex-[calc((20ch-100%)*99)]">
          <Form
            onChange={(e) => {
              search(e.currentTarget);
            }}
          >
            <p className="flex h-fl-lg items-center gap-fl-2xs rounded-md border border-input py-fl-3xs ps-fl-xs shadow-sm ring-offset-primary-container transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
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
        <main className="mx-auto flex w-full max-w-prose flex-1 flex-col p-fl-sm">
          <Page aria-labelledby="search-results-heading">
            <PageHeading id="search-results-heading">
              Search results
            </PageHeading>
            <Virtuoso
              useWindowScroll
              increaseViewportBy={200}
              data={searchResults}
              initialItemCount={isInitial ? searchResultPage.length : undefined}
              // React Virtuoso sends undefined sometimes
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              computeItemKey={(index, result) => result?.id ?? index}
              context={{
                query,
                loading:
                  navigation.state === "loading" &&
                  new URLSearchParams(navigation.location.search).get("q") ===
                    query,
                hasMore: nextCursor != null,
                loadMore: () => {
                  if (nextCursor != null) {
                    setSearchParams((prev) => {
                      prev.set("cursor", nextCursor);
                      return prev;
                    });
                  }
                },
              }}
              itemContent={(_, result) =>
                // React Virtuoso sends undefined sometimes
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                result != null && (
                  <Link
                    to={`/todo/${result.id}`}
                    className={twJoin(
                      "flex w-full rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none max-sm:min-w-max",
                      result.isDone && "line-through",
                    )}
                  >
                    <div className="mx-fl-2xs my-fl-3xs inline-flex overflow-hidden">
                      {buildSearchHeadline(result.name, tokens).map(
                        ({ value, highlight }, i) =>
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
                )
              }
              components={{
                List: SearchResultList,
                Item: SearchResultItem,
                Footer: SearchResultFooter,
                EmptyPlaceholder: EmptySearchResultsPlaceholder,
              }}
            />
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

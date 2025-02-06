import useResizeObserver from "@react-hook/resize-observer";
import { Plus, Search, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const [searchResults, nextCursor] = await searchTasks({
    query,
    user,
    cursor: url.searchParams.get("cursor"),
    size: pageSize,
  });
  return {
    searchResults,
    nextCursor,
    query: q,
    isAuthenticated: true,
  };
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "To-do search", error }) }];
}

type SearchResultComponents = Components<
  TaskSearchResult,
  {
    query: string;
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    setFooterHeight: (height: number) => void;
    setListHeight: (height: number) => void;
  }
>;

class NullResizeObserver {
  disconnect() {
    // Do nothing
  }
  observe() {
    // Do nothing
  }
  unobserve() {
    // Do nothing
  }
}

function noop() {
  // Do nothing
}

function useHeight(
  target: Element | null,
  setHeight: (height: number) => void,
) {
  useLayoutEffect(() => {
    const height = target?.getBoundingClientRect().height;
    if (height != null) {
      setHeight(height);
    }
  }, [target, setHeight]);
  useResizeObserver(
    target,
    (entry) => {
      const height = entry.borderBoxSize[0]?.blockSize;
      if (height != null) {
        setHeight(height);
      }
    },
    {
      polyfill:
        typeof document === "undefined" ? NullResizeObserver : undefined,
    },
  );
}

// ESLint is not picking up Typescript types from React Virtuoso
/* eslint-disable react/prop-types */
const SearchResultList: SearchResultComponents["List"] = ({
  context,
  ref,
  ...props
}) => {
  const [listRef, setListRef] = useState<HTMLUListElement | null>(null);
  useHeight(listRef, context?.setListHeight ?? noop);

  return (
    <ul
      className="space-y-fl-2xs"
      ref={(node) => {
        if (typeof ref === "function") {
          ref(node as HTMLDivElement | null);
        } else if (ref != null) {
          ref.current = node as HTMLDivElement | null;
        }
        setListRef(node);
      }}
      {...props}
    />
  );
};

const SearchResultItem: SearchResultComponents["Item"] = ({
  context,
  item,
  ...props
}) => {
  return <li {...props} />;
};

const SearchResultFooter: SearchResultComponents["Footer"] = ({ context }) => {
  const [ref, setRef] = useState<HTMLButtonElement | null>(null);
  useHeight(ref, context?.setFooterHeight ?? noop);

  if (!context?.hasMore) {
    return null;
  }

  return (
    <PendingButton
      pending={context.loading}
      pendingText="Loading…"
      variant="secondary"
      type="button"
      ref={setRef}
      onClick={context.loadMore}
      className="my-fl-2xs"
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
        <p className="mt-fl-sm text-muted-foreground text-xl">
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

export default function TaskSearchRoute({ loaderData }: Route.ComponentProps) {
  const { query, searchResults: searchResultPage, nextCursor } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitial = !searchParams.has("cursor");
  const { queryRef, search } = useSearch(query);
  const searchResults = usePaginate(searchResultPage, isInitial);
  const navigation = useNavigation();
  const [listHeight, setListHeight] = useState<number | null>(null);
  const [footerHeight, setFooterHeight] = useState<number | null>(null);
  const tokens = query?.split(/\s+/) ?? [];

  return (
    <div className="flex min-h-svh flex-col">
      <header className="gap-fl-xs border-primary-container bg-primary-container p-fl-2xs dark:border-accent top-0 z-10 flex flex-wrap items-center border-b shadow sm:sticky">
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
            <p className="h-fl-lg gap-fl-2xs border-input py-fl-3xs ps-fl-xs ring-offset-primary-container focus-within:ring-ring flex items-center rounded-md border shadow-sm transition-colors focus-within:ring-2 focus-within:ring-offset-2">
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
                className="placeholder:text-muted-foreground w-full flex-1 bg-transparent text-base focus-visible:outline-none md:text-sm"
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
        <main className="p-fl-sm mx-auto flex w-full max-w-prose flex-1 flex-col">
          <Page aria-labelledby="search-results-heading">
            <PageHeading id="search-results-heading" className="mb-fl-2xs">
              Search results
            </PageHeading>
            <div
              style={{
                height:
                  listHeight != null
                    ? listHeight + (footerHeight ?? 0)
                    : undefined,
              }}
              className="mb-fl-2xs"
            >
              <Virtuoso
                useWindowScroll
                increaseViewportBy={200}
                data={searchResults}
                initialItemCount={
                  isInitial ? searchResultPage.length : undefined
                }
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
                      setSearchParams(
                        (prev) => {
                          prev.set("cursor", nextCursor);
                          return prev;
                        },
                        {
                          replace: true,
                          preventScrollReset: true,
                        },
                      );
                    }
                  },
                  setListHeight,
                  setFooterHeight,
                }}
                itemContent={(_, result) =>
                  // React Virtuoso sends undefined sometimes
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  result != null && (
                    <Link
                      to={`/todo/${result.id}`}
                      className={twJoin(
                        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex w-full rounded-sm transition-colors focus:outline-none max-sm:min-w-max",
                        result.isDone && "line-through",
                      )}
                    >
                      <div className="mx-fl-2xs my-fl-3xs inline-flex overflow-hidden">
                        {buildSearchHeadline(result.name, tokens).map(
                          ({ value, highlight }, i) =>
                            highlight ? (
                              <b
                                key={i}
                                className="bg-primary/50 flex-none font-normal"
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
            </div>
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

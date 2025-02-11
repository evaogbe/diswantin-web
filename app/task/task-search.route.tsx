import { useState } from "react";
import { Link, useNavigation, useSearchParams } from "react-router";
import { Virtuoso } from "react-virtuoso";
import { twJoin } from "tailwind-merge";
import type { Route } from "./+types/task-search.route";
import { buildSearchHeadline } from "./format";
import {
  EmptySearchResultsPlaceholder,
  SearchResultFooter,
  SearchResultItem,
  SearchResultList,
  usePaginate,
} from "./search-result";
import type { Size } from "./search-result";
import { searchTasks } from "./services.server";
import type { TaskSearchResult } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthenticatedUser(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const query = q?.trim();

  let searchResults: TaskSearchResult[] = [];
  let nextCursor = null;
  if (query != null && query.length > 1 && query.length <= 256) {
    [searchResults, nextCursor] = await searchTasks({
      query,
      user,
      cursor: url.searchParams.get("cursor"),
    });
  }

  return {
    searchResults,
    nextCursor,
    query: q?.slice(0, 256) ?? null,
  };
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "To-do search", error }) }];
}

export default function TaskSearchRoute({ loaderData }: Route.ComponentProps) {
  const { query, searchResults: searchResultPage, nextCursor } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitial = !searchParams.has("cursor");
  const searchResults = usePaginate(searchResultPage, isInitial);
  const navigation = useNavigation();
  const [listSize, setListSize] = useState<Size | null>(null);
  const [footerSize, setFooterSize] = useState<Size | null>(null);
  const tokens = query?.split(/\s+/) ?? [];

  return (
    <Page aria-labelledby="search-results-heading">
      <PageHeading
        id="search-results-heading"
        className={twJoin(
          "mb-fl-2xs",
          searchResults.length < 1 && "text-center",
        )}
      >
        Search results
      </PageHeading>
      <div
        style={{
          inlineSize: listSize != null ? listSize.inline : undefined,
          blockSize:
            listSize != null
              ? listSize.block + (footerSize?.block ?? 0)
              : undefined,
        }}
        className="mb-fl-2xs"
      >
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
            setListSize,
            setFooterSize,
          }}
          itemContent={(_, result) =>
            // React Virtuoso sends undefined sometimes
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            result != null && (
              <Link
                to={`/todo/${result.id}`}
                className={twJoin(
                  "hover:bg-accent hover:text-accent-foreground px-fl-2xs py-fl-3xs focus:bg-accent focus:text-accent-foreground flex w-full rounded-sm transition-colors focus:outline-hidden",
                  result.isDone && "line-through",
                )}
              >
                <span className="inline-flex max-w-fit flex-none overflow-hidden">
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
                        <span key={i} className="flex-none whitespace-pre-wrap">
                          {value}
                        </span>
                      ),
                  )}
                </span>
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
  );
}

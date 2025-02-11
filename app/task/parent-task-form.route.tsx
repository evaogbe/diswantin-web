import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Form, useNavigation, useSearchParams } from "react-router";
import { Virtuoso } from "react-virtuoso";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { twJoin } from "tailwind-merge";
import type { Route } from "./+types/parent-task-form.route";
import { buildSearchHeadline } from "./format";
import { parentSchema } from "./model";
import {
  EmptySearchResultsPlaceholder,
  SearchResultFooter,
  SearchResultItem,
  SearchResultList,
  usePaginate,
} from "./search-result";
import type { Size } from "./search-result";
import { saveTaskParent, searchTasks } from "./services.server";
import type { TaskSearchResult } from "./services.server";
import { getAuthenticatedUser } from "~/auth/services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertDescription, AlertTitle } from "~/ui/alert";
import { useScrollIntoView } from "~/ui/scroll-into-view";

export async function loader({ params, request }: Route.LoaderArgs) {
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
    childId: params.id,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthenticatedUser(request);
  const formData = await request.formData();
  return formAction({
    formData,
    requestHeaders: request.headers,
    schema: parentSchema,
    mutation: async (values) => {
      const [existingChild, cookie] = await saveTaskParent(
        values,
        user.id,
        request,
      );
      return {
        status: "success",
        path:
          existingChild == null
            ? "/new-todo?continue="
            : `/edit-todo/${existingChild.id}?continue=`,
        init: { headers: { "Set-Cookie": cookie } },
      };
    },
    humanName: "select the previous to-do",
    hiddenFields: ["childId", "parentId"],
  });
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Select previous to-do", error }) }];
}

export default function NewParentTaskRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const {
    query,
    searchResults: searchResultPage,
    nextCursor,
    childId,
  } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitial = !searchParams.has("cursor");
  const searchResults = usePaginate(searchResultPage, isInitial);
  const navigation = useNavigation();
  const [listSize, setListSize] = useState<Size | null>(null);
  const [footerSize, setFooterSize] = useState<Size | null>(null);
  const formError =
    actionData?.error != null ? Object.values(actionData.error)[0]?.[0] : null;
  const formErrorRef = useScrollIntoView<HTMLElement>(formError);
  const tokens = query?.split(/\s+/) ?? [];

  return (
    <Page asChild>
      <Form
        method="post"
        aria-labelledby="task-parent-form-heading"
        aria-describedby={formError ? "task-parent-form-error" : undefined}
      >
        <PageHeading
          id="task-parent-form-heading"
          className={twJoin(
            "mb-fl-2xs",
            searchResults.length < 1 && "text-center",
          )}
        >
          Select previous to-do
        </PageHeading>
        {formError != null && (
          <Alert
            variant="destructive"
            id="task-parent-form-error"
            aria-labelledby="task-parent-form-error-heading"
            ref={formErrorRef}
          >
            <AlertCircle aria-hidden="true" className="size-fl-xs" />
            <AlertTitle id="task-parent-form-error-heading">
              Error selecting previous to-do
            </AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <div hidden>
          <input type="hidden" name="childId" defaultValue={childId} />
          <AuthenticityTokenInput />
        </div>
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
              query: null,
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
                <button
                  name="parentId"
                  value={result.id}
                  className={twJoin(
                    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground px-fl-2xs py-fl-3xs flex w-full rounded-sm transition-colors focus:outline-hidden",
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
                          <span
                            key={i}
                            className="flex-none whitespace-pre-wrap"
                          >
                            {value}
                          </span>
                        ),
                    )}
                  </span>
                  {result.isDone && <span className="sr-only">Done</span>}
                </button>
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
      </Form>
    </Page>
  );
}

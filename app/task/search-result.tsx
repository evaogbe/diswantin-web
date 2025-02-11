import useResizeObserver from "@react-hook/resize-observer";
import { noop } from "es-toolkit/function";
import { Plus, Search } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router";
import type { Components } from "react-virtuoso";
import type { TaskSearchResult } from "./services.server";
import { Button } from "~/ui/button";
import { PendingButton } from "~/ui/pending-button";

export function usePaginate(page: TaskSearchResult[], isInitial: boolean) {
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

export type Size = { inline: number; block: number };

type SearchResultComponents = Components<
  TaskSearchResult,
  {
    query: string | null;
    loading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    setFooterSize: (size: Size) => void;
    setListSize: (size: Size) => void;
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

function useSize(target: Element | null, setSize: (size: Size) => void) {
  useLayoutEffect(() => {
    const rect = target?.getBoundingClientRect();
    if (rect != null) {
      setSize({ inline: rect.width, block: rect.height });
    }
  }, [target, setSize]);
  useResizeObserver(
    target,
    (entry) => {
      const size = entry.borderBoxSize[0];
      if (size != null) {
        setSize({ inline: size.inlineSize, block: size.blockSize });
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
export const SearchResultList: SearchResultComponents["List"] = ({
  context,
  ref,
  ...props
}) => {
  const [listRef, setListRef] = useState<HTMLUListElement | null>(null);
  useSize(listRef, context?.setListSize ?? noop);

  return (
    <ul
      className="space-y-fl-2xs min-w-fit"
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

export const SearchResultItem: SearchResultComponents["Item"] = ({
  context,
  item,
  ...props
}) => {
  return <li {...props} />;
};

export const SearchResultFooter: SearchResultComponents["Footer"] = ({
  context,
}) => {
  const [ref, setRef] = useState<HTMLButtonElement | null>(null);
  useSize(ref, context?.setFooterSize ?? noop);

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

export const EmptySearchResultsPlaceholder: SearchResultComponents["EmptyPlaceholder"] =
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
        {context?.query != null && (
          <p className="mt-fl-sm">
            <Button asChild>
              <Link to={`/new-todo?name=${context.query.trim()}`}>
                <Plus aria-hidden="true" /> Add to-do
              </Link>
            </Button>
          </p>
        )}
      </div>
    );
  };

import { useSearchParams as useSearchParamsBase } from "react-router";

export function useSearchParams() {
  const [searchParams, setSearchParams] = useSearchParamsBase();
  return {
    searchParams,
    setSearchParams,
    withSearchParam: (name: string, value = "") => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set(name, value);
      return `?${newSearchParams}`;
    },
    withoutSearchParam: (name: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete(name);
      return `?${newSearchParams}`;
    },
  };
}

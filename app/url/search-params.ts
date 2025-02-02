export function withSearchParam(
  searchParams: URLSearchParams,
  name: string,
  value = "",
) {
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.set(name, value);
  return `?${newSearchParams}`;
}

export function withoutSearchParam(
  searchParams: URLSearchParams,
  name: string,
) {
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.delete(name);
  return `?${newSearchParams}`;
}

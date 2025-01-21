import { useEffect, useRef } from "react";

export function useScrollIntoView<E extends Element>(deps: unknown[]) {
  const ref = useRef<E>(null);
  useEffect(() => {
    ref.current?.scrollIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

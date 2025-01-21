import { useEffect, useRef } from "react";

export function useScrollIntoView<E extends Element>(dep: unknown) {
  const ref = useRef<E>(null);
  useEffect(() => {
    if (dep != null) {
      ref.current?.scrollIntoView();
    }
  }, [dep]);
  return ref;
}

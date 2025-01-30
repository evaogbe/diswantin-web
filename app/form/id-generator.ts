import { useId, useState } from "react";
import { uid } from "uid";

export function useIdGenerator() {
  const initial = useId();
  const [id, setId] = useState(initial);
  return [
    id,
    () => {
      setId(uid());
    },
  ] as const;
}

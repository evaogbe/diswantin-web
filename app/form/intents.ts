import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import type { Fetcher } from "react-router";

export function useIntents(...fetchers: Fetcher[]) {
  const navigation = useNavigation();
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  useEffect(() => {
    let intent;
    if (navigation.state === "submitting") {
      intent = navigation.formData?.get("intent");
    } else {
      const fetcher = fetchers.find((f) => f.state === "submitting");
      if (fetcher != null) {
        intent = fetcher.formData?.get("intent");
      }
    }

    if (typeof intent === "string") {
      setLastIntent(intent);
    }
  }, [navigation, fetchers]);
  return lastIntent;
}

import * as React from "react";

const NonceContext = React.createContext("");

export const NonceProvider = NonceContext.Provider;

export function useNonce() {
  return React.useContext(NonceContext);
}

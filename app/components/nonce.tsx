import { createContext, useContext } from "react";

const NonceContext = createContext("");

export const NonceProvider = NonceContext.Provider;

export function useNonce() {
  return useContext(NonceContext);
}

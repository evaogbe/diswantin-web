// Use interface for extensions
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import "@remix-run/server-runtime";

declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    cspNonce: string;
  }
}

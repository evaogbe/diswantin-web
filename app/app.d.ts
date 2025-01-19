/// <reference types="vite-plugin-svgr/client" />
// Use interface for extensions
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cspNonce: string;
  }
}

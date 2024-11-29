/* eslint-disable @typescript-eslint/consistent-type-definitions */
import {
  ByRoleMatcher,
  ByRoleOptions,
  Matcher,
  MatcherOptions,
  SelectorMatcherOptions,
} from "@testing-library/dom";
import "nightwatch";

interface Queries {
  getByRole(
    role: ByRoleMatcher,
    options?: ByRoleOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
  getByLabelText(
    id: Matcher,
    options?: SelectorMatcherOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
  getByText(
    id: Matcher,
    options?: SelectorMatcherOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
  getByDisplayValue(
    id: Matcher,
    options?: MatcherOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
  findByRole(
    role: ByRoleMatcher,
    options?: ByRoleOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
  findByLabelText(
    id: Matcher,
    options?: SelectorMatcherOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
  findByText(
    id: Matcher,
    options?: SelectorMatcherOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
  findByDisplayValue(
    id: Matcher,
    options?: MatcherOptions,
  ): Awaitable<NightwatchAPI, ElementGlobal>;
}

declare module "nightwatch" {
  interface NightwatchCustomCommands extends Queries {
    within(element: ElementGlobal): Queries;
  }
}

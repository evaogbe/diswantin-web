import PsychologyAlt from "@material-design-icons/svg/filled/psychology_alt.svg?react";
import { Plus, Search, Settings } from "lucide-react";
import { useRef, useState } from "react";
import { Link as RouteLink, useSearchParams } from "react-router";
import { twJoin } from "tailwind-merge";
import { GuestFooter } from "./guest-footer";
import logo from "./logo.png";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import { ThemeToggle } from "~/theme/theme-toggle";
import { Button } from "~/ui/button";
import { cn } from "~/ui/classes";
import { Link } from "~/ui/link";

export function MainLayout({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  const [searchParams] = useSearchParams();
  const [showSkipNav, setShowSkipNav] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex min-h-svh min-w-fit flex-col">
      <p className={twJoin(!showSkipNav && "sr-only")}>
        <Link
          to={`?${searchParams}#main`}
          onFocus={() => {
            setShowSkipNav(true);
          }}
          onBlur={() => {
            setShowSkipNav(false);
          }}
          onClick={() => {
            setShowSkipNav(false);
            mainRef.current?.focus();
          }}
        >
          Skip to content
        </Link>
      </p>
      <header className="gap-fl-xs border-primary-container bg-primary-container p-fl-2xs dark:border-accent top-0 z-10 flex flex-wrap items-center border-b shadow-sm sm:sticky">
        <h1 className={twJoin(!isAuthenticated && "flex-1")}>
          <RouteLink
            to={isAuthenticated ? "/home" : "/"}
            className={cn(navigationMenuTriggerStyle(), "text-base")}
          >
            <img src={logo} alt="" width="32" height="32" />
            <span className="max-sm:sr-only">Diswantin</span>
          </RouteLink>
        </h1>
        {isAuthenticated && (
          <>
            <p className="flex-1">
              <Button
                variant="secondary"
                size="icon"
                asChild
                className="sm:hidden"
              >
                <RouteLink to="/search">
                  <Search aria-label="Search" />
                </RouteLink>
              </Button>
              <Button
                variant="secondary"
                asChild
                className="w-full justify-start max-sm:hidden"
              >
                <RouteLink to="/search">
                  <Search aria-hidden="true" />
                  <span>Search</span>
                </RouteLink>
              </Button>
            </p>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink to="/new-todo">
                    <Plus aria-hidden="true" />
                    <span className="max-sm:sr-only">New to-do</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink to="/advice">
                    <PsychologyAlt aria-hidden="true" />
                    <span className="max-sm:sr-only">Advice</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink to="/settings">
                    <Settings aria-hidden="true" />
                    <span className="max-sm:sr-only">Settings</span>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </>
        )}
        <ThemeToggle />
      </header>
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="p-fl-sm focus-visible:ring-ring mx-auto flex w-full max-w-prose flex-1 flex-col transition-colors focus-visible:ring-1 focus-visible:outline-hidden max-sm:min-w-fit"
      >
        {children}
      </main>
      {!isAuthenticated && <GuestFooter />}
    </div>
  );
}

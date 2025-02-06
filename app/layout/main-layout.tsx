import PsychologyAlt from "@material-design-icons/svg/filled/psychology_alt.svg?react";
import { Plus, Search, Settings } from "lucide-react";
import { Link } from "react-router";
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

export function MainLayout({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh min-w-fit flex-col">
      <header className="gap-fl-xs border-primary-container bg-primary-container p-fl-2xs dark:border-accent top-0 z-10 flex flex-wrap items-center border-b shadow sm:sticky">
        <h1 className={twJoin(!isAuthenticated && "flex-1")}>
          <Link
            to={isAuthenticated ? "/home" : "/"}
            className={cn(navigationMenuTriggerStyle(), "text-base")}
          >
            <img src={logo} alt="" width="32" height="32" />
            <span className="max-sm:sr-only">Diswantin</span>
          </Link>
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
                <Link to="/search">
                  <Search aria-label="Search" />
                </Link>
              </Button>
              <Button
                variant="secondary"
                asChild
                className="w-full justify-start max-sm:hidden"
              >
                <Link to="/search">
                  <Search aria-hidden="true" />
                  <span>Search</span>
                </Link>
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
      <main className="p-fl-sm mx-auto flex w-full max-w-prose flex-1 flex-col max-sm:min-w-fit">
        {children}
      </main>
      {!isAuthenticated && <GuestFooter />}
    </div>
  );
}

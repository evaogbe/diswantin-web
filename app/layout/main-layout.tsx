import { Link } from "@remix-run/react";
import { Plus, Settings } from "lucide-react";
import logo from "./logo.png";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./navigation-menu";
import { ThemeToggle } from "~/theme/theme-toggle";
import { cn } from "~/ui/classes";

export function MainLayout({
  isAuthenticated,
  children,
}: {
  isAuthenticated: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-2xs border-b border-primary-container bg-primary-container p-2xs shadow dark:border-accent">
        <h1 className="flex-1">
          <Link
            to={isAuthenticated ? "/home" : "/"}
            className={cn(navigationMenuTriggerStyle(), "text-base")}
          >
            <img src={logo} alt="" width="24" height="24" />
            <span className="sr-only sm:not-sr-only">Diswantin</span>
          </Link>
        </h1>
        {isAuthenticated && (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink to="/new-todo">
                  <Plus aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">New to-do</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink to="/settings">
                  <Settings aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Settings</span>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-prose flex-1 flex-col p-sm">
        {children}
      </main>
    </div>
  );
}

import { Moon, Sun } from "lucide-react";
import { Theme, useTheme } from "remix-themes";
import { useHydrated } from "remix-utils/use-hydrated";
import { Button } from "~/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/ui/dropdown-menu";

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const isHydrated = useHydrated();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun
            className="size-sm rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            aria-label="Light mode"
            aria-hidden={!isHydrated || theme !== Theme.LIGHT}
          />
          <Moon
            className="absolute size-sm rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            aria-label="Dark mode"
            aria-hidden={!isHydrated || theme !== Theme.DARK}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setTheme(Theme.LIGHT);
          }}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme(Theme.DARK);
          }}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme(null);
          }}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
            className="size-fl-sm scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
            aria-label="Light mode"
            aria-hidden={!isHydrated || theme !== Theme.LIGHT}
          />
          <Moon
            className="size-fl-sm absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
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

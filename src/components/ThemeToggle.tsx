import { useTheme } from "@/components/theme-context";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

/**
 * Toggles UI theme between light and dark modes.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
export default ThemeToggle;

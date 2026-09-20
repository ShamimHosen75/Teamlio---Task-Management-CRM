import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { readAppearance, saveAppearance, type ThemeMode } from "@/lib/appearance";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const sync = () => setTheme(readAppearance().mode);
    sync();
    window.addEventListener("teamlio-appearance-change", sync);
    return () => window.removeEventListener("teamlio-appearance-change", sync);
  }, []);

  function toggleTheme() {
    const current = readAppearance();
    const effectiveDark = document.documentElement.classList.contains("dark");
    const nextTheme: ThemeMode = effectiveDark ? "light" : "dark";
    setTheme(nextTheme);
    saveAppearance({ ...current, mode: nextTheme });
  }

  const isDark = theme === "dark" || (theme === "system" && typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label}>
          {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-1 rounded-xl bg-secondary/80 border border-border/50 flex items-center gap-1 select-none">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
          theme === "light"
            ? "bg-card text-foreground shadow-xs border border-border/40 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
        }`}
      >
        <Sun
          className={`size-3.5 ${theme === "light" ? "text-amber-500 fill-amber-500/20" : ""}`}
        />
        <span className="hidden sm:inline">Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
          theme === "dark"
            ? "bg-card text-foreground shadow-xs border border-border/40 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
        }`}
      >
        <Moon
          className={`size-3.5 ${theme === "dark" ? "text-indigo-400 fill-indigo-400/20" : ""}`}
        />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}

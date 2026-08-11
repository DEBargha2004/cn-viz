import { useAppStore } from "../../state/appStore";
import { Sun, Moon } from "lucide-react";
import { useEffect } from "react";

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme ?? "light");
  const setTheme = useAppStore((s) => s.setTheme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className="p-1 rounded-xl bg-secondary/80 border border-border/50 flex items-center gap-1 select-none">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
          !isDark
            ? "bg-card text-foreground shadow-xs border border-border/40 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
        }`}
      >
        <Sun className={`size-3.5 ${!isDark ? "text-amber-500 fill-amber-500/20" : ""}`} />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
          isDark
            ? "bg-card text-foreground shadow-xs border border-border/40 font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-card/40"
        }`}
      >
        <Moon className={`size-3.5 ${isDark ? "text-indigo-400 fill-indigo-400/20" : ""}`} />
        <span>Dark</span>
      </button>
    </div>
  );
}

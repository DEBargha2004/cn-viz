import { NavLink } from "react-router-dom";
import { type ChapterMeta } from "../../lib/content";
import { cn } from "../../lib/utils";
import { LayoutGrid } from "lucide-react";

interface ChapterNavListProps {
  chapters: ChapterMeta[];
  onItemClick?: () => void;
}

export function ChapterNavList({ chapters, onItemClick }: ChapterNavListProps) {
  return (
    <nav className="flex flex-col gap-5 select-none">
      {/* Overview / Home Link */}
      <div className="flex flex-col gap-1">
        <NavLink
          to="/"
          end
          onClick={onItemClick}
          className={({ isActive }) =>
            cn(
              "group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer border",
              isActive
                ? "bg-primary text-primary-foreground border-primary/20 shadow-xs"
                : "text-muted-foreground border-transparent hover:bg-accent/80 hover:text-accent-foreground"
            )
          }
        >
          <LayoutGrid className="size-4 shrink-0" />
          <span>All Chapters</span>
        </NavLink>
      </div>

      {/* Chapters Group */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          <span>Chapters</span>
          <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground border border-border/40">
            {chapters.length}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {chapters.map((chapter) => (
            <NavLink
              key={chapter.id}
              to={`/chapters/${chapter.id}`}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-xs transition-all duration-200 cursor-pointer border overflow-hidden",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/30 font-semibold shadow-2xs"
                    : "text-muted-foreground border-transparent hover:bg-accent/60 hover:text-foreground"
                )
              }
            >
              {/* Active left indicator bar */}
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary transition-all duration-200",
                      isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    )}
                  />
                  <div className="flex items-center gap-2.5 min-w-0 pl-1">
                    <span
                      className={cn(
                        "font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground group-hover:bg-accent-foreground/10 group-hover:text-foreground"
                      )}
                    >
                      {String(chapter.order).padStart(2, "0")}
                    </span>
                    <span className="truncate">{chapter.title}</span>
                  </div>

                  <span
                    className={cn(
                      "font-mono text-[10px] shrink-0 px-1.5 py-0.5 rounded-full border transition-colors",
                      isActive
                        ? "bg-primary/15 border-primary/20 text-primary"
                        : "bg-secondary/40 border-border/30 text-muted-foreground/70 group-hover:text-muted-foreground"
                    )}
                  >
                    {chapter.topicOrder.length} topics
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

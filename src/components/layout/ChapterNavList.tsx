import { NavLink, useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import { type ChapterMeta } from "../../lib/content";
import { cn } from "../../lib/utils";
import { LayoutGrid } from "lucide-react";

interface ChapterNavListProps {
  chapters: ChapterMeta[];
  onItemClick?: () => void;
}

export function ChapterNavList({ chapters, onItemClick }: ChapterNavListProps) {
  const location = useLocation();

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
              "group relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer border",
              isActive
                ? "bg-primary text-primary-foreground border-primary/20 shadow-xs"
                : "text-muted-foreground border-transparent hover:bg-accent/80 hover:text-accent-foreground"
            )
          }
        >
          <LayoutGrid className="size-4.5 shrink-0" />
          <span>All Chapters</span>
        </NavLink>
      </div>

      {/* Chapters Group */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          <span>Chapters</span>
          <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground border border-border/40 font-semibold">
            {chapters.length}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {chapters.map((chapter) => {
            const isChapterActive = location.pathname === `/chapters/${chapter.id}`;

            return (
              <div key={chapter.id} className="flex flex-col">
                <NavLink
                  to={`/chapters/${chapter.id}`}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 cursor-pointer border overflow-hidden",
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
                            "font-mono text-xs font-bold px-2 py-0.5 rounded-md shrink-0 transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground group-hover:bg-accent-foreground/10 group-hover:text-foreground"
                          )}
                        >
                          {String(chapter.order).padStart(2, "0")}
                        </span>
                        <span className="truncate font-medium">{chapter.title}</span>
                      </div>

                      <span
                        className={cn(
                          "font-mono text-xs shrink-0 px-2 py-0.5 rounded-full border transition-colors font-medium",
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

                {/* Sub-topics Accordion for Active Chapter */}
                {isChapterActive && chapter.topicOrder && chapter.topicOrder.length > 0 && (
                  <div className="ml-6 pl-3 my-1 border-l-2 border-primary/30 flex flex-col gap-1.5 animate-in fade-in duration-200">
                    {chapter.topicOrder.map((topicId, i) => (
                      <button
                        key={topicId}
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemClick?.();
                          const isMobile = window.innerWidth < 768;
                          scroller.scrollTo(`topic-${topicId}`, {
                            duration: 500,
                            delay: 0,
                            smooth: "easeInOutCubic",
                            offset: isMobile ? -80 : -24,
                          });
                        }}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 text-left transition-colors cursor-pointer w-full"
                      >
                        <span className="font-mono text-xs font-extrabold text-primary/80 shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate capitalize leading-snug">
                          {topicId.replace(/-/g, " ")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

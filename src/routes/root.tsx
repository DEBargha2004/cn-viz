import { Outlet, Link } from "react-router-dom";
import { getAllChapterMetas } from "../lib/content";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { GlobalSpeedControl } from "../components/layout/GlobalSpeedControl";
import { ChapterNavList } from "../components/layout/ChapterNavList";
import { MobileTopBar } from "../components/layout/MobileTopBar";
import { Network } from "lucide-react";

export default function RootLayout() {
  const chapters = getAllChapterMetas();

  return (
    <div className="flex min-h-screen bg-background font-sans antialiased">
      {/* Desktop Sidebar: hidden on mobile */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-sidebar-border bg-sidebar sticky top-0 h-screen select-none shrink-0 z-30">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
          <Link to="/" className="group flex items-center gap-3 w-full">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-2xs">
              <Network className="size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-foreground">
                  CN-Viz
                </span>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  v1.0
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                Interactive Learning
              </span>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-3">
          <ChapterNavList chapters={chapters} />
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto p-3.5 border-t border-sidebar-border flex flex-col gap-3 bg-sidebar/60 backdrop-blur-xs">
          <GlobalSpeedControl />
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar: hidden on desktop */}
        <MobileTopBar chapters={chapters} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

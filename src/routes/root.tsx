import { Outlet } from "react-router-dom";
import { getAllChapterMetas } from "../lib/content";
import { AppSidebar } from "../components/layout/AppSidebar";
import { ThemeProvider } from "../components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

export default function RootLayout() {
  const chapters = getAllChapterMetas();

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SidebarProvider>
        <div className="flex min-h-screen bg-background font-sans antialiased w-full">
          <AppSidebar chapters={chapters} />

          {/* Main Body */}
          <div className="flex-1 flex flex-col min-w-0 w-full relative">
            {/* Mobile / Global Header Area */}
            <header className="flex h-14 items-center gap-2 border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-50 px-4 md:px-6">
              <SidebarTrigger />
              <div className="md:hidden font-bold text-sm tracking-tight">CN-Viz</div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

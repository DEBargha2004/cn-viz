import { NavLink, useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import { type ChapterMeta } from "../../lib/content";
import { LayoutGrid, Network } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSpeedControl } from "./GlobalSpeedControl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../ui/sidebar";

// We use import.meta.glob to eagerly load JUST the titles from the JSON files
// This allows the sidebar to display the exact title used in the minimap
// without having to eagerly load the entire massive markdown/viz payloads.
const topicTitles = import.meta.glob("../../../content/chapters/*/topics/*.json", {
  eager: true,
  import: "title",
}) as Record<string, string>;

function getTopicTitle(chapterId: string, topicId: string): string {
  const path = `../../../content/chapters/${chapterId}/topics/${topicId}.json`;
  // Fallback to capitalizing the slug if the title isn't found
  return topicTitles[path] || topicId.replace(/-/g, " ");
}

interface AppSidebarProps {
  chapters: ChapterMeta[];
}

export function AppSidebar({ chapters }: AppSidebarProps) {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    // Automatically close the mobile sidebar when a link is clicked
    setOpenMobile(false);
  };

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <NavLink to="/" onClick={handleLinkClick}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/25">
                    <Network className="size-4.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-bold text-foreground tracking-tight">
                      CN-Viz
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Interactive Learning
                    </span>
                  </div>
                </NavLink>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === "/"}
                render={
                  <NavLink to="/" end onClick={handleLinkClick}>
                    <LayoutGrid className="size-4" />
                    <span>All Chapters</span>
                  </NavLink>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
            <span>Chapters</span>
            <span className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-muted-foreground border border-border/40 font-semibold">
              {chapters.length}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chapters.map((chapter) => {
                const isChapterActive =
                  location.pathname === `/chapters/${chapter.id}`;

                return (
                  <SidebarMenuItem key={chapter.id} className="mb-1.5">
                    <SidebarMenuButton
                      isActive={isChapterActive}
                      className={`h-auto py-2.5 px-3.5 relative border transition-all duration-200 ${
                        isChapterActive
                          ? "bg-primary/10 text-primary border-primary/30 font-semibold shadow-2xs hover:bg-primary/15 hover:text-primary"
                          : "text-muted-foreground border-transparent hover:bg-accent/60 hover:text-foreground"
                      }`}
                      render={
                        <NavLink
                          to={`/chapters/${chapter.id}`}
                          onClick={handleLinkClick}
                          title={chapter.title}
                        >
                          {/* Active left indicator bar */}
                          <span
                            className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary transition-all duration-200 ${
                              isChapterActive
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-75"
                            }`}
                          />
                          <div className="flex items-center justify-between w-full min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0 pl-1 flex-1">
                              <span
                                className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                                  isChapterActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground group-hover/menu-button:bg-accent-foreground/10 group-hover/menu-button:text-foreground"
                                }`}
                              >
                                {String(chapter.order).padStart(2, "0")}
                              </span>
                              <span className="truncate">{chapter.title}</span>
                            </div>

                            <span
                              className={`font-mono text-xs shrink-0 px-2 py-0.5 rounded-full border transition-colors font-medium ml-2 ${
                                isChapterActive
                                  ? "bg-primary/15 border-primary/20 text-primary"
                                  : "bg-secondary/40 border-border/30 text-muted-foreground/70 group-hover/menu-button:text-muted-foreground"
                              }`}
                            >
                              {chapter.topicOrder.length} topics
                            </span>
                          </div>
                        </NavLink>
                      }
                    />

                    {isChapterActive &&
                      chapter.topicOrder &&
                      chapter.topicOrder.length > 0 && (
                        <SidebarMenuSub className="ml-6 pl-3 my-2 border-l-2 border-primary/30 flex flex-col gap-1.5 pr-0 animate-in fade-in duration-200 border-none">
                          <div className="border-l-2 border-primary/30 pl-3 flex flex-col gap-1.5 -ml-[13px]">
                            {chapter.topicOrder.map((topicId, i) => {
                              const fullTitle = getTopicTitle(
                                chapter.id,
                                topicId,
                              );
                              return (
                                <SidebarMenuSubItem key={topicId}>
                                  <SidebarMenuSubButton
                                    className="h-auto py-1.5 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors cursor-pointer w-full"
                                    render={
                                      <button
                                        title={fullTitle}
                                        className="flex items-center gap-2 cursor-pointer w-full text-left"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleLinkClick();
                                          const isMobile =
                                            window.innerWidth < 768;
                                          scroller.scrollTo(
                                            `topic-${topicId}`,
                                            {
                                              duration: 500,
                                              delay: 0,
                                              smooth: "easeInOutCubic",
                                              offset: isMobile ? -80 : -24,
                                            },
                                          );
                                        }}
                                      >
                                        <span className="font-mono text-xs font-extrabold text-primary/80 shrink-0">
                                          {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="truncate leading-snug">
                                          {fullTitle}
                                        </span>
                                      </button>
                                    }
                                  />
                                </SidebarMenuSubItem>
                              );
                            })}
                          </div>
                        </SidebarMenuSub>
                      )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3.5 flex flex-col gap-3 bg-sidebar/60">
        <GlobalSpeedControl />
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}

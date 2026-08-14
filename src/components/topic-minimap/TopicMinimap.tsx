import { useState } from "react";
import { type Chapter } from "../../lib/content";
import { cn } from "../../lib/utils";
import { useActiveTopic } from "../../hooks/useActiveTopic";
import {
  ListTree,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Compass,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

interface TopicMinimapProps {
  chapter: Chapter;
}

interface MinimapViewProps {
  chapter: Chapter;
  activeTopicId: string;
  onSelectTopic: (topicId: string) => void;
  activeIndex: number;
  progressPercentage?: number;
}

/**
 * Topic Minimap Orchestrator
 * Keeps active scrollspy state localized so parent ChapterPage and TopicCards NEVER re-render on scroll.
 */
export function TopicMinimap({ chapter }: TopicMinimapProps) {
  const { activeTopicId, scrollToTopic, activeIndex, progressPercentage } =
    useActiveTopic(chapter.topics);

  return (
    <>
      {/* Desktop Progress Rail (xl:flex fixed right margin with toggleable single button mode & smooth transitions) */}
      <TopicProgressRail
        chapter={chapter}
        activeTopicId={activeTopicId}
        onSelectTopic={scrollToTopic}
        activeIndex={activeIndex}
        progressPercentage={progressPercentage}
      />

      {/* Mobile & Tablet Floating Navigation Dock (< xl viewports with shadcn Drawer) */}
      <TopicMinimapMobile
        chapter={chapter}
        activeTopicId={activeTopicId}
        onSelectTopic={scrollToTopic}
        activeIndex={activeIndex}
      />
    </>
  );
}

/**
 * Top Header Overview Strip (Rendered inline below Chapter Title with smooth accordion transitions)
 */
export function TopicMinimapHeader({ chapter }: TopicMinimapProps) {
  const { activeTopicId, scrollToTopic } = useActiveTopic(chapter.topics);
  const [collapsed, setCollapsed] = useState(false);
  const topics = chapter.topics || [];

  return (
    <div className="bg-card/80 border border-border/80 rounded-2xl p-3.5 shadow-2xs transition-all duration-300">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground tracking-tight">
          <Compass className="size-4 text-primary shrink-0" />
          <span>Chapter Topic Index</span>
          <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full border border-border/40">
            {topics.length} topics
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
        >
          <span>{collapsed ? "Show Index" : "Collapse"}</span>
          {collapsed ? (
            <ChevronDown className="size-3.5 transition-transform duration-200" />
          ) : (
            <ChevronUp className="size-3.5 transition-transform duration-200" />
          )}
        </Button>
      </div>

      {/* Horizontal Topic Pills with Smooth Grid Collapse Transition */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          collapsed
            ? "grid-rows-[0fr] opacity-0 pt-0"
            : "grid-rows-[1fr] opacity-100 pt-1",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => {
              const isActive = topic.id === activeTopicId;
              const hasViz =
                topic.visualizations && topic.visualizations.length > 0;

              return (
                <button
                  key={topic.id}
                  title={topic.title}
                  onClick={() => scrollToTopic(topic.id)}
                  className={cn(
                    "first:ml-1 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all duration-200 cursor-pointer border",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs scale-[1.02]"
                      : "bg-background/80 hover:bg-accent hover:text-accent-foreground border-border/60 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded-md",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate max-w-[150px] sm:max-w-[220px]">
                    {topic.title}
                  </span>
                  {hasViz && (
                    <Sparkles
                      className={cn(
                        "size-3 shrink-0",
                        isActive ? "text-primary-foreground" : "text-primary",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop Progress Rail with Smooth Open/Close Transitions (xl:flex)
 * Smoothly morphs between a single compact floating button pill and full interactive list.
 */
function TopicProgressRail({
  chapter,
  activeTopicId,
  onSelectTopic,
  activeIndex,
  progressPercentage = 0,
}: MinimapViewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const topics = chapter.topics || [];

  return (
    <aside className="hidden xl:flex fixed right-6 top-24 z-30 select-none">
      <div
        className={cn(
          "bg-card/95 backdrop-blur-xl border shadow-lg rounded-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col items-end",
          isCollapsed
            ? "w-[240px] p-2 border-primary/30 shadow-md"
            : "w-60 p-3 border-border/80 shadow-xl",
        )}
      >
        {/* Collapsed Bar Trigger (Smooth Fade-in / Fade-out) */}
        <div
          className={cn(
            "w-full transition-all duration-300 ease-in-out",
            isCollapsed
              ? "opacity-100 max-h-12 scale-100 pointer-events-auto"
              : "opacity-0 max-h-0 scale-95 pointer-events-none overflow-hidden",
          )}
        >
          <button
            onClick={() => setIsCollapsed(false)}
            className="group flex items-center justify-between w-full p-1.5 px-2.5 text-xs font-semibold cursor-pointer rounded-xl hover:bg-accent/60 transition-colors"
            title="Expand Topic Minimap"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Compass className="size-4 text-primary shrink-0 group-hover:rotate-45 transition-transform duration-300" />
              <span className="font-mono text-[10px] font-extrabold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 shrink-0">
                {String(activeIndex + 1).padStart(2, "0")}/
                {String(topics.length).padStart(2, "0")}
              </span>
              <span className="truncate max-w-[110px] text-muted-foreground group-hover:text-foreground">
                {topics[activeIndex]?.title}
              </span>
            </div>
            <Maximize2 className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-1" />
          </button>
        </div>

        {/* Expanded Content Rail (Smooth Expand / Contract) */}
        <div
          className={cn(
            "w-full space-y-3 transition-all duration-300 ease-in-out",
            !isCollapsed
              ? "opacity-100 max-h-[85vh] scale-100 pointer-events-auto"
              : "opacity-0 max-h-0 scale-95 pointer-events-none overflow-hidden",
          )}
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Compass className="size-3.5 text-primary" />
              <span>Progress Rail</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                {activeIndex + 1}/{topics.length}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsCollapsed(true)}
                className="size-6 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Minimize to button"
              >
                <Minimize2 className="size-3.5" />
                <span className="sr-only">Minimize to button</span>
              </Button>
            </div>
          </div>

          {/* Progress Fill Line */}
          <div className="space-y-1">
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Topic Links */}
          <div className="flex flex-col gap-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5 custom-scrollbar">
            {topics.map((topic, index) => {
              const isActive = topic.id === activeTopicId;
              const hasViz =
                topic.visualizations && topic.visualizations.length > 0;
              const isPassed = index < activeIndex;

              return (
                <button
                  key={topic.id}
                  title={topic.title}
                  onClick={() => onSelectTopic(topic.id)}
                  className={cn(
                    "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left transition-all duration-150 cursor-pointer border w-full",
                    isActive
                      ? "bg-primary/10 text-primary border-primary/30 font-semibold shadow-2xs"
                      : "text-muted-foreground border-transparent hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 flex items-center justify-center min-w-[18px]",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isPassed
                            ? "bg-primary/15 text-primary"
                            : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-[11px] leading-snug">
                      {topic.title}
                    </span>
                  </div>

                  {hasViz && (
                    <Sparkles
                      className={cn(
                        "size-3 shrink-0",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground/60 group-hover:text-primary",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * Mobile Dock with shadcn Drawer (< xl viewports)
 */
function TopicMinimapMobile({
  chapter,
  activeTopicId,
  onSelectTopic,
  activeIndex,
}: MinimapViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const topics = chapter.topics || [];

  const activeTopic = topics[activeIndex] || topics[0];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < topics.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onSelectTopic(topics[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectTopic(topics[activeIndex + 1].id);
    }
  };

  return (
    <div className="xl:hidden fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-background/95 dark:bg-card/95 backdrop-blur-xl border border-primary/25 shadow-xl rounded-2xl p-2.5 flex items-center justify-between gap-2.5">
        {/* Active Topic Info */}
        <div className="flex items-center gap-2 min-w-0 flex-1 pl-1">
          <span className="font-mono text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-lg shrink-0">
            {String(activeIndex + 1).padStart(2, "0")}/
            {String(topics.length).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              {activeTopic?.title}
            </span>
            {activeTopic?.visualizations &&
              activeTopic.visualizations.length > 0 && (
                <Sparkles className="size-3 text-primary shrink-0 animate-pulse" />
              )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            disabled={!hasPrev}
            onClick={handlePrev}
            className="size-8 rounded-xl hover:bg-accent disabled:opacity-30 cursor-pointer"
            title="Previous Topic"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous Topic</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            disabled={!hasNext}
            onClick={handleNext}
            className="size-8 rounded-xl hover:bg-accent disabled:opacity-30 cursor-pointer"
            title="Next Topic"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Next Topic</span>
          </Button>

          {/* Drawer Trigger */}
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger
              render={
                <Button
                  size="sm"
                  variant="default"
                  className="rounded-xl gap-1.5 px-3 text-xs shadow-xs font-semibold cursor-pointer"
                >
                  <ListTree className="size-3.5" />
                  <span>Map</span>
                </Button>
              }
            />
            <DrawerContent>
              <DrawerHeader className="border-b border-border pb-3">
                <DrawerTitle className="flex items-center justify-between text-base font-bold text-foreground">
                  <div className="flex items-center gap-2">
                    <ListTree className="size-5 text-primary" />
                    <span>Chapter Topic Drawer</span>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                    {topics.length} Topics
                  </span>
                </DrawerTitle>
              </DrawerHeader>

              {/* Topic items in drawer */}
              <div className="overflow-y-auto space-y-1.5 max-h-[60vh] pr-1 py-1">
                {topics.map((topic, index) => {
                  const isActive = topic.id === activeTopicId;
                  const hasViz =
                    topic.visualizations && topic.visualizations.length > 0;

                  return (
                    <button
                      key={topic.id}
                      title={topic.title}
                      onClick={() => {
                        onSelectTopic(topic.id);
                        setDrawerOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between w-full p-3 rounded-xl text-xs text-left transition-all border cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                          : "bg-card/60 text-muted-foreground border-border/40 hover:bg-accent",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate">{topic.title}</span>
                      </div>

                      {hasViz && (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                          <Sparkles className="size-3" />
                          <span>{topic.visualizations.length} viz</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </div>
  );
}

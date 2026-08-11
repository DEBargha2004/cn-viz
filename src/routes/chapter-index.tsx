import { useState } from "react";
import { Link } from "react-router-dom";
import { getAllChapterMetas } from "../lib/content";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { BookOpen, ArrowRight, Search, Sparkles, Layers, Sliders, Zap } from "lucide-react";

export default function ChapterIndex() {
  const chapters = getAllChapterMetas();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChapters = chapters.filter((chapter) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const matchesTitle = chapter.title.toLowerCase().includes(query);
    const matchesId = chapter.id.toLowerCase().includes(query);
    const matchesTopics = chapter.topicOrder.some((t) => t.toLowerCase().includes(query));
    return matchesTitle || matchesId || matchesTopics;
  });

  const totalTopics = chapters.reduce((sum, ch) => sum + ch.topicOrder.length, 0);

  return (
    <div className="flex flex-col gap-10 py-2 md:py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/90 to-background p-6 md:p-10 shadow-xs">
        {/* Ambient top-right subtle glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative flex flex-col gap-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit shadow-2xs">
            <Sparkles className="size-3.5" />
            <span>INTERACTIVE COMPUTER NETWORKS PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Master Networks Through{" "}
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              Live Visual Simulations
            </span>
          </h1>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-normal">
            Step into interactive, parameter-driven protocol and topology simulations. Compare data flow modes, analyze connection types, and build deep visual intuition for fundamental networking systems.
          </p>

          {/* Quick Metrics & Feature Chips */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/80 border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground">
              <Layers className="size-3.5 text-primary" />
              <span><strong>{chapters.length}</strong> {chapters.length === 1 ? "Chapter" : "Chapters"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/80 border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground">
              <BookOpen className="size-3.5 text-indigo-500" />
              <span><strong>{totalTopics}</strong> Interactive Topics</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/80 border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground">
              <Sliders className="size-3.5 text-sky-500" />
              <span>Tunable Parameters</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary/80 border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground">
              <Zap className="size-3.5 text-amber-500" />
              <span>Real-Time Speed Controls</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Chapter Content Section */}
      <section className="flex flex-col gap-6">
        {/* Section Header + Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Course Chapters
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Select a chapter to explore interactive topic cards and parameter models.
            </p>
          </div>

          {/* Search Filter Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chapters or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 rounded-xl border-border/80 bg-card text-xs focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Chapter Cards Grid */}
        {filteredChapters.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((chapter) => (
              <Link key={chapter.id} to={`/chapters/${chapter.id}`} className="group block cursor-pointer">
                <Card className="h-full border border-border/70 hover:border-primary/50 transition-all duration-300 shadow-xs hover:shadow-lg hover:shadow-primary/5 bg-card flex flex-col justify-between overflow-hidden group-hover:-translate-y-1">
                  <div>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          CH {String(chapter.order).padStart(2, "0")}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono font-medium text-muted-foreground border-border/60">
                          {chapter.topicOrder.length} {chapter.topicOrder.length === 1 ? "Topic" : "Topics"}
                        </Badge>
                      </div>

                      <div className="size-8 rounded-xl bg-secondary/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 flex items-center justify-center text-muted-foreground shrink-0">
                        <BookOpen className="size-4" />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <CardTitle className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-300">
                        {chapter.title}
                      </CardTitle>

                      {/* Topic Tags Preview */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">
                          Included Topics:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {chapter.topicOrder.slice(0, 4).map((topicSlug) => (
                            <span
                              key={topicSlug}
                              className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-secondary/60 text-muted-foreground border border-border/40 truncate max-w-[140px]"
                            >
                              {topicSlug.replace(/-/g, " ")}
                            </span>
                          ))}
                          {chapter.topicOrder.length > 4 && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/15 font-semibold">
                              +{chapter.topicOrder.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between text-xs font-semibold text-primary">
                    <span>Explore chapter</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card border-dashed space-y-3">
            <Search className="size-8 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">No chapters match "{searchQuery}"</h3>
              <p className="text-xs text-muted-foreground">Try clearing your search query to see all available chapters.</p>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-medium text-primary hover:underline cursor-pointer pt-1"
            >
              Clear search filter
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

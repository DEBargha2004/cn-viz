import { useEffect } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";
import { loadChapter, type Chapter } from "../lib/content";
import { ChapterStoreProvider } from "../state/chapterStore";
import { TopicCard } from "../components/topic-card/TopicCard";
import {
  TopicMinimap,
  TopicMinimapHeader,
} from "../components/topic-minimap/TopicMinimap";

export async function chapterLoader({ params }: LoaderFunctionArgs) {
  const { chapterSlug } = params;
  try {
    const chapter = await loadChapter(chapterSlug!);
    return chapter;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chapter not found";
    throw new Response(message, { status: 404 });
  }
}

export default function ChapterPage() {
  const chapter = useLoaderData() as Chapter;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapter.id]);

  return (
    <ChapterStoreProvider key={chapter.id}>
      <div className="space-y-8 py-2 w-full">
        {/* Chapter Title & Inline Header Minimap */}
        <div className="space-y-4 border-b pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chapter {chapter.order}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              {chapter.title}
            </h1>
          </div>

          <TopicMinimapHeader chapter={chapter} />
        </div>

        {/* Topic Cards Container - Full Width (Zero compression) */}
        <div className="space-y-8 w-full">
          {chapter.topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>

        {/* Responsive Topic Minimap (Fixed Desktop Panel + Floating Mobile Dock) */}
        <TopicMinimap chapter={chapter} />
      </div>
    </ChapterStoreProvider>
  );
}

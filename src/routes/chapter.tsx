/* eslint-disable react-refresh/only-export-components */
import { useLoaderData, type LoaderFunctionArgs } from "react-router-dom";
import { loadChapter, type Chapter } from "../lib/content";
import { ChapterStoreProvider } from "../state/chapterStore";
import { TopicCard } from "../components/topic-card/TopicCard";

export function chapterLoader({ params }: LoaderFunctionArgs) {
  const { chapterSlug } = params;
  try {
    const chapter = loadChapter(chapterSlug!);
    return chapter;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chapter not found";
    throw new Response(message, { status: 404 });
  }
}

export default function ChapterPage() {
  const chapter = useLoaderData() as Chapter;

  return (
    <ChapterStoreProvider>
      <div className="space-y-8 py-2">
        <div className="space-y-2 border-b pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Chapter {chapter.order}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            {chapter.title}
          </h1>
        </div>

        <div className="space-y-8">
          {chapter.topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </ChapterStoreProvider>
  );
}

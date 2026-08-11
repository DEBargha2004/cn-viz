---
trigger: glob
globs: src/routes/**,src/main.tsx
---

# Routing

Use the **data router** (`createBrowserRouter`), not the legacy
declarative-only `<BrowserRouter><Routes>` pattern — loaders are how
chapter content gets fetched and validated before render.

## Structure

```tsx
// src/main.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <ChapterIndex /> },
      {
        path: "chapters/:chapterSlug",
        element: <ChapterPage />,
        loader: chapterLoader,
        errorElement: <ChapterError />,
      },
    ],
  },
]);
```

```tsx
// src/routes/chapter.tsx
import { useLoaderData } from "react-router-dom";
import { ChapterStoreProvider } from "../state/chapterStore";

export async function chapterLoader({ params }: LoaderFunctionArgs) {
  const { chapterSlug } = params;
  const chapter = await loadChapter(chapterSlug!); // reads + validates content JSON
  if (!chapter) throw new Response("Chapter not found", { status: 404 });
  return chapter;
}

export default function ChapterPage() {
  const chapter = useLoaderData() as Chapter;
  return (
    <ChapterStoreProvider>
      <h1>{chapter.title}</h1>
      {chapter.topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </ChapterStoreProvider>
  );
}
```

## Rules

- One route per chapter (`/chapters/:chapterSlug`). Topics are **not**
  separate routes — they're sections rendered within the chapter page, per
  the product requirement ("each chapter may be a separate page").
- Mount `ChapterStoreProvider` inside the chapter route element, not at
  the app root — see `state-management.md` for why (fresh store per
  chapter visit).
- Chapter content loads through the route `loader`, not `useEffect` +
  `useState` inside the component. Validation errors from the content
  schema should surface via `errorElement`, not a silent empty state.
- Lazy-load chapter route modules with `React.lazy`/dynamic `import()` if
  the chapter list grows large enough that bundling all chapters upfront
  becomes a real cost — don't do this preemptively for a handful of
  chapters.

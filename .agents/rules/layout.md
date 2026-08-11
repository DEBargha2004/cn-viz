---
trigger: glob
globs: src/routes/root.tsx,src/routes/chapter-index.tsx,src/components/layout/**
---

# Layout & navigation

## Shell structure

```
RootLayout
├── Sidebar                     (persistent ≥md, Sheet drawer on mobile)
│   ├── SidebarHeader            app title
│   ├── ChapterNavList           one NavLink per chapter, ordered by meta.order
│   └── SidebarFooter            ThemeToggle, GlobalSpeedControl
└── <main>
    └── <Outlet />                ChapterIndex ("/") or ChapterPage ("/chapters/:slug")
```

`RootLayout` is the router's top-level `element` (see `routing.md`) — it
wraps every page, so nav/theme/global controls live here exactly once,
not duplicated per page.

## Chapter list source

The sidebar needs every chapter's `meta.json` (id, title, order) up
front, not just the one loaded by the current chapter route. Add a small
eager loader in `src/lib/content.ts` — reuse the same static
`import.meta.glob` approach as chapter loading, not a second content
system:

```ts
// src/lib/content.ts (addition)
const chapterMetaModules = import.meta.glob<{ default: unknown }>(
  "../../content/chapters/*/meta.json",
  { eager: true },
);

export function getAllChapterMetas(): ChapterMeta[] {
  return Object.values(chapterMetaModules)
    .map((m) => chapterMetaSchema.parse((m as any).default))
    .sort((a, b) => a.order - b.order);
}
```

`RootLayout` calls this directly (it's synchronous, no loader needed for
static bundled data) to render `ChapterNavList`.

## Sidebar: persistent + collapsible

Use shadcn's `Sidebar` component family if present in your shadcn
version (`sidebar.tsx` + `SidebarProvider`); otherwise build the
equivalent from `Sheet` (mobile drawer) + a plain flex column (desktop) —
do not hand-roll a third pattern.

```tsx
// src/routes/root.tsx
import { Outlet, NavLink } from "react-router-dom";
import { getAllChapterMetas } from "../lib/content";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { GlobalSpeedControl } from "../components/layout/GlobalSpeedControl";

export default function RootLayout() {
  const chapters = getAllChapterMetas();

  return (
    <div className="flex min-h-screen">
      {/* Desktop: always visible. Mobile: rendered inside a Sheet triggered
          by a hamburger button in a slim top bar — same ChapterNavList
          component reused in both, don't duplicate the list markup. */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r">
        <ChapterNavList chapters={chapters} />
        <div className="mt-auto p-4 space-y-3">
          <ThemeToggle />
          <GlobalSpeedControl />
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <MobileTopBar chapters={chapters} />{" "}
        {/* md:hidden, hosts the Sheet trigger */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

`ChapterNavList` uses `NavLink`, not `Link`, so the active chapter is
styled distinctly:

```tsx
<NavLink
  to={`/chapters/${chapter.id}`}
  className={({ isActive }) =>
    cn(
      "block rounded-md px-3 py-2 text-sm",
      isActive && "bg-accent font-medium",
    )
  }
>
  {chapter.title}
</NavLink>
```

## Mobile behavior

- Breakpoint: Tailwind `md` (768px). Below it, the `<aside>` is hidden and
  a slim top bar with a hamburger button opens the same
  `ChapterNavList` inside a shadcn `Sheet` (slide-over), not a second nav
  implementation.
- Close the `Sheet` on navigation (`onClick` on each `NavLink` triggers
  the sheet's `onOpenChange(false)`), so tapping a chapter doesn't leave
  the drawer open over the new page.

## Global controls placement

`ThemeToggle` and `GlobalSpeedControl` read/write `useAppStore` directly
— they are the _only_ UI for app-scope state, live once in the sidebar
footer (desktop) / mobile top bar or sheet footer, and are never
duplicated inside a `TopicCard` or `ChapterPage`. A topic whose
visualization has `stateScope: "app"` (see `content-model.md`) still
gets its own local slider in that topic's `ControlPanel` if its
`vizMeta.params` says so — `GlobalSpeedControl` is a separate,
app-wide-only control, not the same UI surfacing twice.

## Landing page (`ChapterIndex`, route `/`)

A simple list/grid of chapters (title + could later add a short
description field to `meta.json` if you want blurbs — not required now).
This page does not need its own loader; it can call
`getAllChapterMetas()` directly like the sidebar does, or receive the
same data via a lightweight root-level loader if you'd rather avoid
calling it in two places — either is fine, just don't build two separate
functions that both read chapter metas.

## Within-chapter topic navigation (optional, not required now)

Not building this unless asked, but worth knowing the shape so
`ChapterPage` doesn't need restructuring later: a sticky in-page anchor
list generated from `topicOrder`, scrolling to each `TopicCard`'s `id` on
click. This is presentational only — it does not touch any state tier,
so add it later as a pure UI addition without revisiting
`state-management.md` or `content-model.md`.

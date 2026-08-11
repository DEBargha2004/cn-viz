# AGENTS.md

## Project

An interactive learning platform organized as **Chapters → Topics → Cards**.
Each chapter is a page. Each topic within a chapter renders as its own card
section containing (a) styled markdown text and (b) an optional visualization,
which may itself expose tunable parameters.

## Stack (non-negotiable — do not introduce alternatives without asking)

- React 18 + Vite + TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui for all UI primitives (buttons, sliders, switches, selects, tabs)
- react-router v6.4+ **data router** (createBrowserRouter + loaders), not
  the legacy `<Routes>` declarative-only pattern
- Zustand for chapter-scoped and app-scoped state (see
  `.agents/rules/state-management.md`)
- Content is JSON/YAML data files, not MDX. Markdown is a plain string field
  rendered via `react-markdown` + `remark-gfm`.
- Visualizations are self-registering `*.viz.tsx` files discovered via
  `import.meta.glob`. See `.agents/rules/visualization-registry.md`.

## Hard constraints

1. **No persistence.** Do not add `zustand/middleware persist`, do not write
   to `localStorage`/`sessionStorage` anywhere. All state (local, chapter,
   app) resets on reload. This was an explicit product decision — do not
   "helpfully" add persistence back in.
2. **No manual visualization registry file.** New visualization types must
   be addable by dropping a `*.viz.tsx` file in `src/visualizations/`
   following the convention in the visualization-registry rule. Never
   reintroduce a hand-maintained `Record<string, Component>` map.
3. **Content authors should not need to touch TypeScript.** Chapter/topic
   content lives entirely in `content/**/*.json`. Anything a
   content-only change requires (new topic, new chapter, re-ordering) must
   not require editing a `.tsx` file.
4. **Renderer choice is per-visualization, not global.** Default to SVG.
   Canvas is only justified when profiling shows SVG DOM cost is the
   bottleneck (roughly hundreds of animated nodes). Never reach for WebGL
   without an explicit ask — this project is 2D.
5. **shadcn/tailwind only for chrome/controls.** Do not pull in a
   competing UI kit (MUI, AntD, Chakra) for buttons/sliders/panels, even
   inside a visualization's control panel.

## Directory structure (target)

```
content/
  chapters/
    <chapter-slug>/
      meta.json
      topics/
        <topic-slug>.json
src/
  routes/
    root.tsx               # RootLayout: sidebar + Outlet
    chapter-index.tsx       # "/" landing page: chapter list
    chapter.tsx             # chapter page: loader + <TopicCard> list
  components/
    layout/
      ChapterNavList.tsx
      MobileTopBar.tsx
      ThemeToggle.tsx
      GlobalSpeedControl.tsx
    topic-card/
      TopicCard.tsx
      MarkdownSection.tsx
      VisualizationSection.tsx
      ControlPanel.tsx
  visualizations/
    registry.ts            # auto-discovery glue only, see rule file
    charts/
      LineChart.viz.tsx
    network/
      PacketSim.viz.tsx
  state/
    appStore.ts
    chapterStore.ts        # factory, not a singleton
    useVizState.ts
  lib/
    content.ts              # loaders + zod schemas for chapter/topic JSON
```

## Workspace rules

Detailed, glob-scoped rules live in `.agents/rules/`:

- `state-management.md` — the three state tiers and `useVizState` (always on)
- `content-model.md` — chapter/topic JSON schema
- `visualization-registry.md` — auto-registration convention, param schema
- `routing.md` — react-router data-router setup
- `ui-styling.md` — TopicCard composition, shadcn conventions
- `layout.md` — app shell, persistent collapsible sidebar, global controls
- `testing.md` — what layers require tests vs. what's exempt

Read the relevant rule file before working in its area, even if it isn't
auto-attached for the current glob.

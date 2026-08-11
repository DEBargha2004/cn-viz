---
trigger: glob
globs: src/components/**
---

# UI & styling

## TopicCard composition

One `TopicCard` per topic, composed from two independent sections — never
merge their logic into one component:

```
TopicCard
├── MarkdownSection        (renders topic.markdown)
└── VisualizationSection   (renders 0..n entries from topic.visualizations)
    └── ControlPanel        (only if the viz's vizMeta.params is non-empty)
```

```tsx
// src/components/topic-card/TopicCard.tsx
export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{topic.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MarkdownSection markdown={topic.markdown} />
        {topic.visualizations.map((vizRef, i) => (
          <VisualizationSection key={i} topicId={topic.id} vizRef={vizRef} />
        ))}
      </CardContent>
    </Card>
  );
}
```

## MarkdownSection

`react-markdown` + `remark-gfm` (tables, strikethrough, task lists). Style
output via Tailwind Typography (`prose` classes), not custom CSS per
element:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownSection({ markdown }: { markdown: string }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
```

## VisualizationSection + ControlPanel

```tsx
// src/components/topic-card/VisualizationSection.tsx
import { Suspense } from "react";
import { vizRegistry } from "../../visualizations/registry";
import { useVizState } from "../../state/useVizState";
import { ControlPanel } from "./ControlPanel";

export function VisualizationSection({
  topicId,
  vizRef,
}: {
  topicId: string;
  vizRef: VizRef;
}) {
  const entry = vizRegistry[vizRef.vizKey];
  if (!entry) return <UnknownVizFallback vizKey={vizRef.vizKey} />; // never silently render nothing

  const defaults = Object.fromEntries(
    (entry.meta.params ?? []).map((p) => [
      p.key,
      vizRef.paramOverrides?.[p.key] ?? p.default,
    ]),
  );
  const [values, setValues] = useVizState(topicId, vizRef.stateScope, defaults);
  const [isPlaying, setIsPlaying] = useState(false); // Animations are paused by default

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <Suspense fallback={<VizSkeleton />}>
        <entry.component
          {...vizRef.props}
          values={values}
          isPlaying={entry.meta.animated ? isPlaying : undefined}
        />
      </Suspense>
      {(entry.meta.params?.length || entry.meta.animated) ? (
        <ControlPanel
          params={entry.meta.params ?? []}
          values={values}
          onChange={setValues}
          animated={entry.meta.animated}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
        />
      ) : null}
    </div>
  );
}
```

`ControlPanel` renders one shadcn control per `VizParamDef`, mapped by
`type` — `Slider` for `number`, `Switch` for `boolean`, `Select` for
`select`. If `animated` is true, it also renders a dedicated Play/Pause button (defaulting to paused). Build this once, generically; do not hand-write a bespoke
controls UI per visualization. Keep it visually consistent with the rest
of the app (it's shadcn components, not a floating dev-tools-style panel
like `leva` — deliberately, so end users see one coherent design
language).

## General shadcn/Tailwind conventions

- Compose from shadcn primitives (`Card`, `Slider`, `Switch`, `Select`,
  `Tabs`, `Button`) — don't reimplement them.
- Utility classes in JSX; extract to a `cva` variant only when a
  component has genuinely distinct visual states (not for one-off
  spacing tweaks).
- Respect dark mode (`dark:` variants) on every new component — this app
  supports theme switching via `useAppStore`.
- No inline `style={{}}` for anything expressible in Tailwind. Exception:
  computed SVG/Canvas geometry (positions, dimensions) inside
  visualization components, where it's the correct tool.

## Visualization Layout & Styling Standards

All `*.viz.tsx` interactive visualizations must adhere to the following visual design standard:

1. **Large Full-Width Canvas**:
   - The SVG canvas container must be full-width with generous vertical space (`w-full min-h-[200px] sm:min-h-[360px] md:min-h-[420px] rounded-2xl border bg-slate-100/80 dark:bg-slate-950/90 border-slate-200/80 dark:border-slate-800 flex items-center justify-center p-2 sm:p-4`).
   - Use subtle ambient background grid patterns with theme-aware opacity (`radial-gradient(currentColor 1px, transparent 1px)`).

2. **Canvas Overlays & HUD Controls**:
   - Place real-time interactive selection badges or status indicators directly inside the SVG canvas as floating HUD overlays (`absolute top-3 left-3 bg-background/90 dark:bg-slate-900/90 backdrop-blur-md border rounded-xl px-3 py-1.5`).

3. **Bottom Details Grid**:
   - Position supplementary metrics, mathematical formulas, SPOF/reliability badges, and key trade-off summary cards in a responsive multi-column grid *below* the SVG canvas (`grid grid-cols-1 md:grid-cols-3 gap-4 pt-2`).

4. **Dark & Light Mode Theme Adaptability**:
   - Use theme-aware colors for all SVG shapes, cables, text, and container fills (`fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 text-slate-800 dark:text-slate-200`). Never hardcode dark-only or light-only colors for canvas background or nodes.

5. **Centered SVG Animations**:
   - SVG pulsing/pinging elements (e.g. `animate-ping`) must scale radially from their exact center point. Translate parent group to target coordinates (`<g transform={`translate(${x}, ${y})`}>`) and set `cx="0" cy="0"` with `style={{ transformOrigin: 'center', transformBox: 'fill-box' }}`.


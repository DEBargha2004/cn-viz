---
trigger: glob
globs: src/visualizations/**
---

# Visualization registry

The registry is **open-ended by design**. Never add a new visualization
type by editing a hand-maintained map — follow the file convention below
and it is discovered automatically.

## Convention

Every visualization is a single file matching `**/*.viz.tsx` under
`src/visualizations/`. It must:

1. Default-export the component.
2. Named-export a `vizMeta` object describing it.

```tsx
// src/visualizations/network/PacketSim.viz.tsx
import { type VizMeta } from "../types";

export const vizMeta: VizMeta = {
  key: "network-packet-sim",
  title: "Packet Transmission Simulator",
  category: "network",
  renderer: "svg", // 'svg' | 'canvas' | 'html'
  params: [
    {
      key: "latencyMs",
      type: "number",
      label: "Latency (ms)",
      default: 100,
      min: 0,
      max: 2000,
      step: 10,
    },
    {
      key: "lossRate",
      type: "number",
      label: "Packet loss",
      default: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      key: "protocol",
      type: "select",
      label: "Protocol",
      default: "tcp",
      options: [
        { label: "TCP", value: "tcp" },
        { label: "UDP", value: "udp" },
      ],
    },
  ],
};

interface Props {
  topology: "client-server" | "mesh";
  protocol?: "tcp" | "udp";
  // tunable values are injected by VisualizationSection as `values`
  values: Record<string, unknown>;
  // injected if vizMeta.animated is true. Defaults to false (paused).
  isPlaying?: boolean;
}

export default function PacketSim({ topology, values }: Props) {
  // implementation
  return <svg viewBox="0 0 700 400" />;
}
```

## Param schema (`VizMeta['params']`)

```ts
// src/visualizations/types.ts
export type VizParamDef =
  | {
      key: string;
      type: "number";
      label: string;
      default: number;
      min: number;
      max: number;
      step?: number;
    }
  | { key: string; type: "boolean"; label: string; default: boolean }
  | {
      key: string;
      type: "select";
      label: string;
      default: string;
      options: { label: string; value: string }[];
    }
  | { key: string; type: "color"; label: string; default: string };

export interface VizMeta {
  key: string;
  title: string;
  category: string;
  renderer: "svg" | "canvas" | "html";
  animated?: boolean;
  params?: VizParamDef[];
}
```

`ControlPanel` (see `ui-styling.md`) renders one shadcn control per param
def — `Slider` for `number`, `Switch` for `boolean`, `Select` for
`select`, a color input for `color`. Do not hand-build per-visualization
control panels; if a param type doesn't fit this schema, extend the
schema, don't bypass it.

## Auto-discovery glue (the only "registry" file — do not add to it manually)

```ts
// src/visualizations/registry.ts
import { lazy } from "react";
import type { VizMeta } from "./types";

const metaModules = import.meta.glob<{ vizMeta: VizMeta }>("./**/*.viz.tsx", {
  eager: true,
  import: undefined,
});

const componentLoaders = import.meta.glob("./**/*.viz.tsx");

interface RegistryEntry {
  meta: VizMeta;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

export const vizRegistry: Record<string, RegistryEntry> = {};

for (const [path, mod] of Object.entries(metaModules)) {
  const meta = (mod as any).vizMeta as VizMeta | undefined;
  if (!meta) continue; // file didn't export vizMeta — skip, don't throw at build time
  vizRegistry[meta.key] = {
    meta,
    component: lazy(componentLoaders[path] as any),
  };
}
```

This is glue, not configuration — it should never need a manual edit when
a new `*.viz.tsx` file is added. If you find yourself editing this file
to "register" something, stop: the file is missing `vizMeta` or doesn't
match the glob.

## Renderer choice

- **Default to SVG.** Crisp, per-element interactive, fine for moderate
  object counts (the large majority of charts and diagrams here).
- **Canvas** only once profiling shows SVG DOM cost is the bottleneck —
  roughly hundreds of simultaneously animated elements (e.g. a
  packet-swarm simulation, not a single client-server handshake).
- **No WebGL/three.js/pixi.js** without an explicit ask. This project is
  2D; don't reach for 3D tooling preemptively.

## Animation choice

- **Simulation-time-driven animation** (packets moving along a path,
  anything with a scrubbable/playable timeline): a custom
  `requestAnimationFrame` loop driven by your own clock, using
  `path.getPointAtLength()` for SVG paths or `d3-interpolate` for value
  tweening. **It must respect the injected `isPlaying` prop**, only advancing progress when true. By default, all animated visualizations start paused. Do not use CSS transitions or Framer Motion for this — they
  run on wall-clock time, not simulation time, and won't support
  pause/scrub/speed-multiplier correctly.
- **UI-level animation** (card expand/collapse, control panel
  enter/exit, hover states): Framer Motion — it's already a app-wide
  dependency for this, don't hand-roll it.
- **Data-driven attribute tweening in charts** (bar height changes when
  data updates): `d3-transition`.

## Math/layout primitives

Pull individual D3 modules as needed, not the `d3` umbrella package:
`d3-scale`, `d3-shape`, `d3-interpolate`, `d3-ease`, `d3-force`,
`d3-path`. For standard statistical charts prefer `Observable Plot` or
`visx` over hand-rolling axes/scales from scratch, unless the chart's
interactivity needs are custom enough that they'd fight the library.

---
trigger: glob
description: Chapter/topic JSON schema, validated with zod, loaded via react-router loaders.
globs: content/**/*.json,src/lib/content*.ts,src/types/content*.ts
---

# Content model

Content authors edit only files under `content/`. No TypeScript required
for adding a topic or a chapter.

## File layout

```
content/chapters/<chapter-slug>/meta.json
content/chapters/<chapter-slug>/topics/<topic-slug>.json
```

## `meta.json` (one per chapter)

```json
{
  "id": "networking-fundamentals",
  "title": "Networking Fundamentals",
  "order": 1,
  "topicOrder": ["osi-model", "tcp-handshake", "udp-vs-tcp"]
}
```

## topic JSON (one per topic, filename = topic id)

```json
{
  "id": "tcp-handshake",
  "title": "The TCP Three-Way Handshake",
  "markdown": "TCP establishes a connection using a **three-way handshake**...\n\n- SYN\n- SYN-ACK\n- ACK",
  "visualizations": [
    {
      "vizKey": "network-packet-sim",
      "stateScope": "local",
      "props": {
        "topology": "client-server",
        "protocol": "tcp"
      },
      "paramOverrides": {
        "latencyMs": 250
      }
    }
  ]
}
```

Notes:

- `visualizations` is an **array** — a topic may have zero, one, or several
  visualizations (e.g. a static diagram plus an animated one).
- `vizKey` must match a `vizMeta.key` exported by some `*.viz.tsx` file
  (see `visualization-registry.md`). Validate this at load time, not just
  at runtime render — fail the loader with a clear error if the key is
  unknown, don't silently render nothing.
- `stateScope` is `"local" | "chapter" | "app"`, default `"local"` if
  omitted. This is passed straight into `useVizState`.
- `props` are fixed, non-tunable configuration for the component instance
  (e.g. which topology to draw). `paramOverrides` overrides specific
  tunable-param defaults declared in the viz's own `vizMeta.params` (e.g.
  start this topic's slider at 250ms instead of the component's own
  default) — it does not add new params.

## Schema validation

Define and export zod schemas in `src/lib/content.ts`; validate every
chapter/topic file through them in the loader, not ad hoc:

```ts
import { z } from "zod";

export const vizRefSchema = z.object({
  vizKey: z.string(),
  stateScope: z.enum(["local", "chapter", "app"]).default("local"),
  props: z.record(z.unknown()).default({}),
  paramOverrides: z.record(z.unknown()).default({}),
});

export const topicSchema = z.object({
  id: z.string(),
  title: z.string(),
  markdown: z.string(),
  visualizations: z.array(vizRefSchema).default([]),
});

export const chapterMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  topicOrder: z.array(z.string()),
});
```

## Loading

Use Vite's `import.meta.glob` for static discovery of chapter/topic JSON
at build time (content is bundled, not fetched from an API — no CMS per
current scope). The chapter route loader (`src/routes/chapter.tsx`) reads
`meta.json`, resolves `topicOrder` against the topic files, validates each
through the zod schemas above, and returns the assembled chapter object.

Do not fetch content over the network unless explicitly asked to add a
CMS/API layer later — that would be a scope change to this rule.

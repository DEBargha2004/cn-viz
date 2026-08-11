---
trigger: glob
globs: **/\*.test.ts,**/_.test.tsx,\*\*/_.spec.ts,\*_/_.spec.tsx,vitest.config.\*
---

# Testing

## Stack

- **Vitest** (Vite-native, shares config/aliases with the app — do not add
  Jest).
- **React Testing Library** for component tests, `jsdom` environment.
- **`@testing-library/jest-dom`** matchers, loaded via a `vitest.setup.ts`
  referenced in `vitest.config.ts`'s `test.setupFiles`.
- No Playwright/e2e for now — this is a content/learning site, not a
  transactional flow. Revisit only if explicitly asked.

## What to test (and why these specifically)

Test the parts where a bug silently breaks content or corrupts state
across chapters — not every leaf visualization.

### 1. Content schema & loader (`src/lib/content.ts`)

- Valid chapter/topic JSON parses into the expected shape.
- Malformed JSON (missing required field, wrong type, unknown `vizKey`)
  is **rejected loudly** — assert the loader throws/returns an error, per
  the "fail with a clear error, don't silently render nothing" rule in
  `content-model.md`.
- `topicOrder` in `meta.json` correctly resolves and orders the topic
  files; a `topicOrder` entry with no matching topic file fails clearly
  rather than being skipped silently.

### 2. Visualization registry integrity (`src/visualizations/registry.ts`)

One generic test suite, not one test per visualization file:

```ts
import { vizRegistry } from "../visualizations/registry";

test("every registered viz has a well-formed vizMeta", () => {
  for (const [key, entry] of Object.entries(vizRegistry)) {
    expect(entry.meta.key).toBe(key); // key matches its own registration
    expect(entry.meta.title).toBeTruthy();
    expect(["svg", "canvas", "html"]).toContain(entry.meta.renderer);
    for (const param of entry.meta.params ?? []) {
      expect(param.key).toBeTruthy();
      if (param.type === "number")
        expect(param.min).toBeLessThanOrEqual(param.max);
    }
  }
});

test("no duplicate vizKeys across files", () => {
  const keys = Object.keys(vizRegistry);
  expect(new Set(keys).size).toBe(keys.length);
});
```

This one suite catches a malformed new `*.viz.tsx` file automatically —
it's what makes the self-registration convention safe to trust without
per-file tests.

### 3. `useVizState` scope isolation (`src/state/useVizState.ts`)

The thing most likely to break silently and cause a hard-to-spot bug:

- `local` scope: two `TopicCard` instances using the same `topicId` string
  (shouldn't normally happen, but) don't share state — confirms it's
  genuinely component-local, not keyed globally.
- `chapter` scope: mounting two separate `ChapterStoreProvider` trees
  (simulating two chapter visits) produces **independent** stores — a
  value set in one must not appear in the other. This is the single most
  important test in the project; a leak here means chapter state bleeding
  across navigation.
- `app` scope: two components under the same tree both read/write the
  same value via the app store.
- **Reset the app store between tests** (`useAppStore.setState(initialState, true)`
  in an `afterEach`) — it's a singleton, so state will leak across test
  files otherwise even though there's no persistence at runtime.

### 4. Generic UI components

- `ControlPanel`: given a `VizParamDef[]`, renders the correct shadcn
  control per `type`, and calls `onChange` with the right shape when
  interacted with. Test this generically across param types, not per
  visualization that happens to use it.
- `VisualizationSection`: renders the fallback (not a blank section) when
  `vizRef.vizKey` doesn't match anything in the registry.
- `MarkdownSection`: GFM features (tables, task lists) render as expected
  elements, not raw text.

## What's exempt from required testing

Simple, presentational visualization components — a sine wave, a line
encoding diagram, a static protocol diagram — do **not** need dedicated
tests just for existing. Forcing a test on every `*.viz.tsx` file
contradicts keeping these small; the registry-integrity suite above
already catches structural mistakes (bad `vizMeta`, bad param bounds).

**Do** write a test for a visualization when it contains actual logic
whose correctness matters independent of rendering — e.g.:

- CRC/parity computation in an error-detection visualization: test the
  computation function directly (extract it from the component, don't
  test it through rendered SVG).
- A flow-control state machine (stop-and-wait, sliding window): test the
  state transitions (window advances, retransmit on timeout) as pure
  logic, separate from the animation/rendering.

Rule of thumb: if a visualization has a pure function computing something
non-trivial, extract and unit-test that function. If it's just geometry
math driving an SVG (a sine wave's `y = A·sin(...)`), that's covered by
eyeballing it — don't test trigonometry.

## File naming & location

Colocate: `Component.tsx` + `Component.test.tsx` in the same folder.
Hooks: `useVizState.ts` + `useVizState.test.ts`. Do not create a parallel
`__tests__/` tree.

## CI

`vitest run` (not `--watch`) as a required check before merge, alongside
typecheck (`tsc --noEmit`) and lint. No coverage-percentage gate — the
sections above define what must be covered, not a number to chase.

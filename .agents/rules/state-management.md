---
activation: always_on
description: Three-tier state model (local / chapter / app) and the useVizState hook contract. No persistence anywhere.
---

# State management

Three tiers. Every piece of UI state belongs to exactly one tier — decide
by asking "who else needs to see this value?"

| Tier    | Lifetime                  | Mechanism                                   | Example                                   |
|---------|----------------------------|----------------------------------------------|--------------------------------------------|
| local   | one card instance          | `useState` / `useReducer` in the component   | card expanded/collapsed, active viz tab    |
| chapter | one chapter page visit     | Zustand store instance, created per chapter  | "sync all diagrams in this chapter" toggle, a param two topics in the same chapter share |
| app     | whole session               | single global Zustand store                  | theme, global animation-speed multiplier, nav/sidebar state |

**No persistence at any tier.** Never add `zustand/middleware persist`.
Everything resets on full reload. This is intentional — do not add
localStorage "for UX" without being asked.

## Chapter store: factory, not singleton

Chapters must not share a store instance or leak state into each other.
Create the store fresh per chapter mount via a factory + Context provider:

```tsx
// src/state/chapterStore.ts
import { createStore, useStore } from 'zustand';
import { createContext, useContext, useRef, type ReactNode } from 'react';

interface ChapterState {
  vizValues: Record<string, Record<string, unknown>>; // topicId -> param values
  setVizValues: (topicId: string, values: Record<string, unknown>) => void;
}

function createChapterStore() {
  return createStore<ChapterState>((set) => ({
    vizValues: {},
    setVizValues: (topicId, values) =>
      set((s) => ({ vizValues: { ...s.vizValues, [topicId]: values } })),
  }));
}

type ChapterStoreApi = ReturnType<typeof createChapterStore>;
const ChapterStoreContext = createContext<ChapterStoreApi | null>(null);

export function ChapterStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<ChapterStoreApi>();
  if (!storeRef.current) storeRef.current = createChapterStore();
  return (
    <ChapterStoreContext.Provider value={storeRef.current}>
      {children}
    </ChapterStoreContext.Provider>
  );
}

export function useChapterStore<T>(selector: (s: ChapterState) => T): T {
  const store = useContext(ChapterStoreContext);
  if (!store) throw new Error('useChapterStore must be used within a chapter route');
  return useStore(store, selector);
}
```

Mount `<ChapterStoreProvider>` at the top of the chapter route element (in
`src/routes/chapter.tsx`), not at the app root — a fresh instance per
chapter navigation is the point.

## App store: plain singleton, no persist

```ts
// src/state/appStore.ts
import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark';
  globalSpeedMultiplier: number;
  setTheme: (t: 'light' | 'dark') => void;
  setGlobalSpeedMultiplier: (n: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  globalSpeedMultiplier: 1,
  setTheme: (theme) => set({ theme }),
  setGlobalSpeedMultiplier: (n) => set({ globalSpeedMultiplier: n }),
}));
```

## The unified hook: `useVizState`

Every `VisualizationSection` uses this hook to read/write its tunable
params, regardless of which tier the topic's content declares
(`stateScope` field in the topic JSON — see `content-model.md`). Callers
never branch on scope; the hook does.

```ts
// src/state/useVizState.ts
import { useState, useCallback } from 'react';
import { useChapterStore } from './chapterStore';
import { useAppStore } from './appStore';

type Scope = 'local' | 'chapter' | 'app';

export function useVizState<T extends Record<string, unknown>>(
  topicId: string,
  scope: Scope,
  defaults: T,
): [T, (values: T) => void] {
  // local
  const [localValues, setLocalValues] = useState<T>(defaults);

  // chapter — hooks must be called unconditionally, so always call these
  const chapterValues = useChapterStoreSafe(topicId, defaults, scope === 'chapter');
  const appValues = useAppVizValuesSafe(topicId, defaults, scope === 'app');

  if (scope === 'chapter') return chapterValues;
  if (scope === 'app') return appValues;
  return [localValues, setLocalValues as (v: T) => void];
}

// Internal helpers omitted for brevity in this skeleton — implement as
// thin wrappers around useChapterStore/useAppStore that no-op when
// `enabled` is false, so hook-call order stays stable across renders.
```

**Rule:** if you add a new state need that doesn't fit "per-card local,
per-chapter shared, or app-wide global," stop and ask — don't invent a
fourth tier or reach for React Context ad hoc elsewhere.

## Forbidden patterns

- No Redux, Jotai, Recoil, MobX — Zustand only, for consistency.
- No prop-drilling state more than one level. If a value needs to cross
  more than one component boundary, it belongs in a store, not props.
- No `localStorage`/`sessionStorage` reads or writes anywhere in `src/`.

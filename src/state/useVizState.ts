import { useState, useCallback, useContext } from "react";
import { useStore, createStore } from "zustand";
import { ChapterStoreContext, type ChapterState } from "./chapterStore";
import { useAppStore } from "./appStore";

type Scope = "local" | "chapter" | "app";

// Dummy store fallback to prevent throws if ChapterStoreContext is missing
const dummyChapterStore = createStore<ChapterState>(() => ({
  vizValues: {},
  setVizValues: () => {},
}));

function useChapterStoreSafe<T extends Record<string, unknown>>(
  topicId: string,
  defaults: T,
  enabled: boolean
): [T, (values: T) => void] {
  const store = useContext(ChapterStoreContext) ?? dummyChapterStore;
  
  const value = useStore(
    store,
    useCallback((s) => s.vizValues[topicId] as T | undefined, [topicId])
  );
  const setVizValues = useStore(store, useCallback((s) => s.setVizValues, []));

  const setValues = useCallback(
    (newValues: T) => {
      if (enabled) {
        setVizValues(topicId, newValues);
      }
    },
    [topicId, setVizValues, enabled]
  );

  return [enabled ? (value ?? defaults) : defaults, setValues];
}

function useAppVizValuesSafe<T extends Record<string, unknown>>(
  topicId: string,
  defaults: T,
  enabled: boolean
): [T, (values: T) => void] {
  const value = useAppStore(
    useCallback((s) => s.vizValues[topicId] as T | undefined, [topicId])
  );
  const setVizValues = useAppStore(useCallback((s) => s.setVizValues, []));

  const setValues = useCallback(
    (newValues: T) => {
      if (enabled) {
        setVizValues(topicId, newValues);
      }
    },
    [topicId, setVizValues, enabled]
  );

  return [enabled ? (value ?? defaults) : defaults, setValues];
}

export function useVizState<T extends Record<string, unknown>>(
  topicId: string,
  scope: Scope,
  defaults: T
): [T, (values: T) => void] {
  const [localValues, setLocalValues] = useState<T>(defaults);

  const [chapterValues, setChapterValues] = useChapterStoreSafe(topicId, defaults, scope === "chapter");
  const [appValues, setAppValues] = useAppVizValuesSafe(topicId, defaults, scope === "app");

  if (scope === "chapter") {
    return [chapterValues, setChapterValues];
  }
  if (scope === "app") {
    return [appValues, setAppValues];
  }
  return [localValues, setLocalValues as (v: T) => void];
}

import { createStore, useStore } from "zustand";
import React, { createContext, useContext, useState, type ReactNode } from "react";

export interface ChapterState {
  vizValues: Record<string, Record<string, unknown>>; // topicId -> param values
  setVizValues: (topicId: string, values: Record<string, unknown>) => void;
}

export function createChapterStore() {
  return createStore<ChapterState>((set) => ({
    vizValues: {},
    setVizValues: (topicId, values) =>
      set((s) => ({ vizValues: { ...s.vizValues, [topicId]: values } })),
  }));
}

export type ChapterStoreApi = ReturnType<typeof createChapterStore>;
export const ChapterStoreContext = createContext<ChapterStoreApi | null>(null);

export function ChapterStoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createChapterStore());
  return React.createElement(
    ChapterStoreContext.Provider,
    { value: store },
    children
  );
}

export function useChapterStore<T>(selector: (s: ChapterState) => T): T {
  const store = useContext(ChapterStoreContext);
  if (!store) {
    throw new Error("useChapterStore must be used within a chapter route");
  }
  return useStore(store, selector);
}

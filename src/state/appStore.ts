import { create } from "zustand";

export interface AppState {
  globalSpeedMultiplier: number;
  setGlobalSpeedMultiplier: (n: number) => void;
  vizValues: Record<string, Record<string, unknown>>;
  setVizValues: (topicId: string, values: Record<string, unknown>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  globalSpeedMultiplier: 1,
  setGlobalSpeedMultiplier: (n) => set({ globalSpeedMultiplier: n }),
  vizValues: {},
  setVizValues: (topicId, values) =>
    set((s) => ({ vizValues: { ...s.vizValues, [topicId]: values } })),
}));

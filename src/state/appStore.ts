import { create } from "zustand";

export interface AppState {
  theme: "light" | "dark";
  globalSpeedMultiplier: number;
  setTheme: (t: "light" | "dark") => void;
  setGlobalSpeedMultiplier: (n: number) => void;
  vizValues: Record<string, Record<string, unknown>>;
  setVizValues: (topicId: string, values: Record<string, unknown>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  globalSpeedMultiplier: 1,
  setTheme: (theme) => set({ theme }),
  setGlobalSpeedMultiplier: (n) => set({ globalSpeedMultiplier: n }),
  vizValues: {},
  setVizValues: (topicId, values) =>
    set((s) => ({ vizValues: { ...s.vizValues, [topicId]: values } })),
}));

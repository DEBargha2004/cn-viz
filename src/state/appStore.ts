import { create } from "zustand";

const SPEED_STORAGE_KEY = "cnviz-global-speed";

const getInitialSpeed = (): number => {
  try {
    const stored = localStorage.getItem(SPEED_STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 3.0) {
        return parsed;
      }
    }
  } catch {
    // localStorage disabled or unavailable
  }
  return 1;
};

export interface AppState {
  globalSpeedMultiplier: number;
  setGlobalSpeedMultiplier: (n: number) => void;
  vizValues: Record<string, Record<string, unknown>>;
  setVizValues: (topicId: string, values: Record<string, unknown>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  globalSpeedMultiplier: getInitialSpeed(),
  setGlobalSpeedMultiplier: (n) => {
    try {
      localStorage.setItem(SPEED_STORAGE_KEY, n.toString());
    } catch {
      // localStorage disabled or unavailable
    }
    set({ globalSpeedMultiplier: n });
  },
  vizValues: {},
  setVizValues: (topicId, values) =>
    set((s) => ({ vizValues: { ...s.vizValues, [topicId]: values } })),
}));


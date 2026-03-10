import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FeatureFlag = "showSprites" | "showMascot";

interface FeatureFlagsState {
  flags: Record<FeatureFlag, boolean>;
  toggleFlag: (flag: FeatureFlag) => void;
  setFlag: (flag: FeatureFlag, value: boolean) => void;
}

export const FEATURE_FLAG_META: Record<
  FeatureFlag,
  { label: string; description?: string }
> = {
  showSprites: {
    label: "Show sprites on table",
  },
  showMascot: {
    label: "Show mascot",
  },
};

const defaultFlags: Record<FeatureFlag, boolean> = {
  showSprites: false,
  showMascot: true,
};

/**
 * *FeatureFlag type
 * read state of feature flags and toggleFlags
 */
export const useFeatureFlag = create<FeatureFlagsState>()(
  persist(
    (set) => ({
      flags: defaultFlags,

      toggleFlag: (flag) =>
        set((state) => ({
          flags: { ...state.flags, [flag]: !state.flags[flag] },
        })),

      setFlag: (flag, value) =>
        set((state) => ({
          flags: { ...state.flags, [flag]: value },
        })),
    }),
    {
      name: "game-feature-flags",
    },
  ),
);

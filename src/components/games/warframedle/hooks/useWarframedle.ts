import { createGameStore } from "@store/useGameStorage";
import type { Warframe } from "@types/warframe";
import {
  saveDailyProgress,
  loadDailyProgress,
  getTodayDateString,
} from "@services/dailyStorageRepository";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";

export const MAX_WARFRAME_DAILY_ATTEMPTS = 10;

export const useWarframedleStore = createGameStore<Warframe, Warframe>({
  gameId: "warframedle",
  maxDailyAttempts: MAX_WARFRAME_DAILY_ATTEMPTS,
  getTodayKey: getTodayDateString,
  saveDailyProgress,
  loadDailyProgress,
  generateTarget: (items, mode, gameId) => {
    return mode === "daily"
      ? calculateDailyTarget(items, gameId)
      : calculateRandomTarget(items);
  },
  checkWin: (guess, target) => guess.name === target.name,
});

export default useWarframedleStore;

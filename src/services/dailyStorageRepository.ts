// src/services/dailyStorageRepository.ts
import type { Warframe } from "src/types/warframe";
import type { GameStatus } from "src/types/game";

const DAILY_STORAGE_KEY = "warframedle_daily_state";

export interface DailyGameState {
  date: string;
  guesses: string[];
  status: GameStatus;
}

export const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export const saveDailyProgress = (
  guesses: Warframe[],
  status: GameStatus,
): void => {
  const stateToSave: DailyGameState = {
    date: getTodayDateString(),
    guesses: guesses.map((g) => g.name),
    status,
  };
  localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(stateToSave));
};

export const loadDailyProgress = (): DailyGameState | null => {
  const savedState = localStorage.getItem(DAILY_STORAGE_KEY);
  if (!savedState) return null;

  try {
    const parsed = JSON.parse(savedState) as DailyGameState;
    if (parsed.date === getTodayDateString()) {
      return parsed;
    }
  } catch (error) {
    console.error("Error parsing daily storage", error);
  }
  return null;
};

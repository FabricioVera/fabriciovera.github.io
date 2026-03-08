// src/services/dailyStorageRepository.ts
import type { GameStatus } from "src/types/game";

const DAILY_STORAGE_KEY = "daily-state-";

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
  game_id: string,
  guesses: any[],
  status: GameStatus,
): void => {
  const stateToSave: DailyGameState = {
    date: getTodayDateString(),
    guesses: guesses.map((g) => g.name),
    status,
  };
  localStorage.setItem(
    DAILY_STORAGE_KEY + game_id,
    JSON.stringify(stateToSave),
  );
};

export const loadDailyProgress = (game_id: string): DailyGameState | null => {
  const savedState = localStorage.getItem(DAILY_STORAGE_KEY + game_id);
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

import { useCallback } from "react";
import type { BaseGameEntity, GameStatus } from "src/types/game";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "@services/dailyStorageRepository";

//* LOCAL STORAGE DAILY MANAGEMENT
export function useDailyStorage<T extends BaseGameEntity>({
  gameId,
  items,
}: {
  gameId: string;
  items?: T[];
}) {
  /**
   * Carga intentos desde BD.
   * @returns Estado guardado.
   */
  const loadProgress = useCallback(() => {
    if (!items) return null;
    const savedState = loadDailyProgress(gameId);
    if (!savedState) return null;

    const guesses = savedState.guesses
      .map((name: string) => items.find((item) => item.name === name))
      .filter(Boolean) as T[];

    return { guesses, status: savedState.status };
  }, [gameId, items]);

  /**
   * Guarda progreso en BD.
   * @param guesses Intentos.
   */
  const saveProgress = useCallback(
    (guesses: T[], status: GameStatus) => {
      saveDailyProgress(gameId, guesses, status);
    },
    [gameId],
  );

  return { loadProgress, saveProgress };
}

// src/hooks/useDailyGame.ts
import { useState, useCallback, useEffect } from "react";
import type { Warframe } from "src/types/warframe";
import type { GameStatus } from "src/types/game";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "@services/dailyStorageRepository";
import { logger } from "@services/logger";

export function useDailyGame(gameId: string, warframes: Warframe[]) {
  const [gameMode, setGameMode] = useState<"daily" | "random">("daily");
  const [guesses, setGuesses] = useState<Warframe[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");

  const initializeDailyMode = useCallback(() => {
    try {
      const savedState = loadDailyProgress(gameId);

      if (savedState) {
        const rehydratedGuesses = savedState.guesses
          .map((name: string) => warframes.find((w) => w.name === name))
          .filter(Boolean) as Warframe[];

        logger.info(`Estado diario cargado exitosamente para ${gameId}`, {
          intentos: rehydratedGuesses.length,
          status: savedState.status,
        });

        setGuesses(rehydratedGuesses);
        setStatus(savedState.status);
      } else {
        setGuesses([]);
        setStatus("playing");
      }
    } catch (error) {
      logger.error(`Error al inicializar el modo diario en ${gameId}`, error);
      setGuesses([]);
      setStatus("playing");
    }
  }, [gameId, warframes]);

  // Hidratación inicial
  useEffect(() => {
    if (warframes.length > 0) {
      initializeDailyMode();
    }
  }, [initializeDailyMode, warframes.length]);

  // Persistencia automática
  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress(gameId, guesses, status);
    }
  }, [gameId, guesses, status, gameMode]);

  const startDailyMode = useCallback(() => {
    setGameMode("daily");
    initializeDailyMode();
  }, [initializeDailyMode]);

  const startRandomMode = useCallback(() => {
    setGameMode("random");
    setGuesses([]);
    setStatus("playing");
  }, []);

  return {
    gameMode,
    guesses,
    status,
    setGuesses,
    setStatus,
    startDailyMode,
    startRandomMode,
  };
}

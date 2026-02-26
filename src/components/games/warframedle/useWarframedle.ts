import { useCallback, useEffect, useMemo, useState } from "react";
import type { preWarframe, Warframe } from "src/types/warframe";
import type { GameStatus } from "src/types/game";
import { saveDailyScore, saveHighScore } from "src/services/scoreRepository";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "@services/dailyStorageRepository";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";
import { logger } from "@services/logger";

export type GameMode = "daily" | "random";

const MAX_DAILY_ATTEMPTS = 10;

export default function useWarframedle(
  rawData: preWarframe[],
  gameId: string,
  playerName: string | null,
) {
  const [gameMode, setGameMode] = useState<GameMode>("daily");
  const [guesses, setGuesses] = useState<Warframe[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [selectedWarframe, setSelectedWarframe] = useState<string>("");
  const [randomWarframe, setRandomWarframe] = useState<Warframe | null>(null);

  const warframes: Warframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);
  const dailyTarget = useMemo(
    () => calculateDailyTarget(warframes),
    [warframes],
  );
  const targetWarframe =
    gameMode === "daily" ? dailyTarget : randomWarframe || dailyTarget;

  const initializeDailyMode = useCallback(() => {
    try {
      const savedState = loadDailyProgress("warframes");

      if (savedState) {
        const rehydratedGuesses = savedState.guesses
          .map((name) => warframes.find((w) => w.name === name))
          .filter(Boolean) as Warframe[];

        logger.info("Estado diario cargado exitosamente", {
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
      logger.error("Error al inicializar el modo diario", error);
      setGuesses([]);
      setStatus("playing");
    }
  }, [warframes]);

  useEffect(() => {
    initializeDailyMode();
  }, [initializeDailyMode]);

  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress("warframes", guesses, status);
    }
  }, [guesses, status, gameMode]);

  const startDailyMode = useCallback(() => {
    setGameMode("daily");
    initializeDailyMode();
  }, [loadDailyProgress]);

  const startRandomMode = useCallback(() => {
    setRandomWarframe(calculateRandomTarget(warframes));
    setGameMode("random");
    setGuesses([]);
    setStatus("playing");
  }, [warframes]);

  const handleGuess = (warframeName: string) => {
    setSelectedWarframe(warframeName);
    if (status !== "playing") return;

    const guessedWf = warframes.find((w) => w.name === warframeName);
    if (!guessedWf || guesses.some((g) => g.name === guessedWf.name)) return;

    setGuesses((prev) => [guessedWf, ...prev]);

    if (!playerName) return;
    if (guessedWf.name === targetWarframe.name) {
      setStatus("won");
      saveDailyScore(gameId, playerName, guesses.length + 1);
    } else if (gameMode === "daily" && guesses.length >= MAX_DAILY_ATTEMPTS) {
      setStatus("lost");
      saveDailyScore(gameId, playerName, guesses.length + 1);
    }
  };

  const warframeNames = useMemo(() => {
    return warframes
      .filter((wf) => !guesses.some((g) => g.name === wf.name))
      .map((wf) => ({
        name: wf.name,
      }));
  }, [warframes, guesses]);

  return {
    warframes,
    warframeNames,
    targetWarframe,
    gameMode,
    attemptsLeft:
      gameMode === "daily" ? MAX_DAILY_ATTEMPTS - guesses.length : null,
    guesses,
    status,
    selectedWarframe,
    handleGuess,
    startDailyMode,
    startRandomMode,
  };
}

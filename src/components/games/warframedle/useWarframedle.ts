import { useCallback, useEffect, useMemo, useState } from "react";
import type { preWarframe, Warframe } from "src/types/warframe";
import type { GameStatus } from "src/types/game";
import { saveHighScore } from "src/services/scoreRepository";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "@services/dailyStorageRepository";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";

export type GameMode = "daily" | "random";

const MAX_DAILY_ATTEMPTS = 100;

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
    const savedState = loadDailyProgress();

    if (savedState) {
      const rehydratedGuesses = savedState.guesses
        .map((name) => warframes.find((w) => w.name === name))
        .filter(Boolean) as Warframe[];

      setGuesses(rehydratedGuesses);
      setStatus(savedState.status);
    } else {
      setGuesses([]);
      setStatus("playing");
    }
  }, [warframes]);

  useEffect(() => {
    initializeDailyMode();
  }, [initializeDailyMode]);

  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress(guesses, status);
    }
  }, [guesses, status, gameMode]);

  const startDailyMode = useCallback(() => {
    setGameMode("daily");
    loadDailyProgress();
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

    if (guessedWf.name === targetWarframe.name) {
      setStatus("won");
      if (!playerName) return;
      saveHighScore(gameId, playerName, guesses.length);
    } else if (gameMode === "daily" && guesses.length > MAX_DAILY_ATTEMPTS) {
      setStatus("lost");
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

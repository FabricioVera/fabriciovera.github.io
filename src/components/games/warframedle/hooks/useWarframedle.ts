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
import { useDailyGame } from "@hooks/useDailyGame";

export type GameMode = "daily" | "random";

const MAX_DAILY_ATTEMPTS = 10;

export default function useWarframedle(
  rawData: preWarframe[],
  gameId: string,
  playerName: string | null,
) {
  const [selectedWarframe, setSelectedWarframe] = useState<string>("");
  const [randomTarget, setRandomTarget] = useState<Warframe | null>(null);

  const warframes: Warframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);

  const {
    gameMode,
    guesses,
    setGuesses,
    status,
    setStatus,
    startDailyMode,
    startRandomMode: baseStartRandomMode,
  } = useDailyGame(gameId, warframes);

  // * calculate daily target and decide witch isthe target based on gamemode
  const dailyTarget = useMemo(
    () => calculateDailyTarget(warframes),
    [warframes],
  );
  const targetWarframe =
    gameMode === "daily" ? dailyTarget : randomTarget || dailyTarget;

  const startRandomMode = useCallback(() => {
    setRandomTarget(calculateRandomTarget(warframes));
    baseStartRandomMode();
  }, [warframes, baseStartRandomMode]);

  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress("warframes", guesses, status);
    }
  }, [guesses, status, gameMode]);

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

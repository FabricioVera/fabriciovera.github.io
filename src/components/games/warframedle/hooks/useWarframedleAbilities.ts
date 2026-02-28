import { useCallback, useEffect, useMemo, useState } from "react";
import type { preWarframe, Warframe, Ability } from "src/types/warframe";
import type { GameStatus } from "src/types/game";
import { saveDailyScore, saveHighScore } from "src/services/scoreRepository";
import {
  extractAbilitiesPool,
  type AbilityTarget,
} from "@services/abilitydleService";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "@services/dailyStorageRepository";
import { useDailyGame } from "@hooks/useDailyGame";

export type GameMode = "daily" | "random";

const MAX_DAILY_ATTEMPTS = 10;

export default function useWarframedleAbilities(
  rawData: preWarframe[],
  gameId: string,
  playerName: string | null,
) {
  const [randomTarget, setRandomTarget] = useState<AbilityTarget | null>(null);

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

  const abilitiesPool = useMemo(() => extractAbilitiesPool(rawData), [rawData]);
  const dailyTarget = useMemo(
    () => calculateDailyTarget(abilitiesPool),
    [abilitiesPool],
  );

  const target: AbilityTarget =
    gameMode === "daily" ? dailyTarget : randomTarget || dailyTarget;

  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress(gameId, guesses, status);
    }
  }, [guesses, status, gameMode]);

  const startRandomMode = useCallback(() => {
    setRandomTarget(calculateRandomTarget(abilitiesPool));
    baseStartRandomMode();
  }, [abilitiesPool, baseStartRandomMode]);

  const handleGuess = (warframe: string) => {
    if (status !== "playing") return;

    const guessedWf = warframes.find((w) => w.name === warframe);
    if (!guessedWf) return;

    const newGuesses = [guessedWf, ...guesses];
    setGuesses(newGuesses);
    if (!playerName) return;

    if (guessedWf.name === target.warframeName) {
      setStatus("won");
      if (gameMode === "daily") {
        saveDailyScore(gameId, playerName, MAX_DAILY_ATTEMPTS - guesses.length);
      }
    } else if (gameMode === "daily" && guesses.length >= MAX_DAILY_ATTEMPTS) {
      setStatus("lost");
      if (gameMode === "daily") {
        saveDailyScore(gameId, playerName, MAX_DAILY_ATTEMPTS - guesses.length);
      }
    }
  };
  const warframeNames = useMemo(() => {
    return abilitiesPool
      .filter((wf) => !guesses.some((g) => g.name === wf.warframeName))
      .map((wf) => ({
        name: wf.warframeName,
      }));
  }, [warframes, guesses]);

  return {
    warframes,
    warframeNames,
    target,
    gameMode,
    attemptsLeft:
      gameMode === "daily" ? MAX_DAILY_ATTEMPTS - guesses.length : null,
    guesses,
    status,
    handleGuess,
    startDailyMode,
    startRandomMode,
  };
}

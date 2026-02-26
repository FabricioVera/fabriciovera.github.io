import { useCallback, useEffect, useMemo, useState } from "react";
import type { preWarframe, Warframe, Ability } from "src/types/warframe";
import type { GameStatus } from "src/types/game";
import { saveHighScore } from "src/services/scoreRepository";
import Rand from "rand-seed";
import {
  extractAbilitiesPool,
  type AbilityTarget,
} from "@services/abilitydleService";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "../../../services/dailyStorageRepository";

export type GameMode = "daily" | "random";

const MAX_DAILY_ATTEMPTS = 100;

export default function useWarframedleAbilities(
  rawData: preWarframe[],
  gameId: string,
  playerName: string | null,
) {
  const [gameMode, setGameMode] = useState<GameMode>("daily");
  const [guesses, setGuesses] = useState<Warframe[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [randomTarget, setRandomTarget] = useState<AbilityTarget | null>(null);

  const warframes: Warframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);
  const abilitiesPool = useMemo(() => extractAbilitiesPool(rawData), [rawData]);
  const dailyTarget = useMemo(
    () => calculateDailyTarget(abilitiesPool),
    [abilitiesPool],
  );

  const target: AbilityTarget =
    gameMode === "daily" ? dailyTarget : randomTarget || dailyTarget;

  const warframeNames = useMemo(() => {
    return warframes
      .filter((wf) => !guesses.some((g) => g.name === wf.name))
      .map((wf) => ({
        name: wf.name,
      }));
  }, [warframes, guesses]);

  const initializeDailyMode = useCallback(() => {
    const savedState = loadDailyProgress(gameId); // Asumiendo que adaptaste el storage para recibir gameId
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
  }, []);

  useEffect(() => {
    initializeDailyMode();
  }, [initializeDailyMode]);

  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress(gameId, guesses, status);
    }
  }, [guesses, status, gameMode]);

  const startDailyMode = useCallback(() => {
    setGameMode("daily");
    initializeDailyMode();
  }, [loadDailyProgress]);

  const startRandomMode = useCallback(() => {
    setRandomTarget(calculateRandomTarget(abilitiesPool));
    setGameMode("random");
    setGuesses([]);
    setStatus("playing");
  }, []);

  const handleGuess = (warframe: string) => {
    if (status !== "playing") return;

    const guessedWf = warframes.find((w) => w.name === warframe);
    if (!guessedWf) return;

    const newGuesses = [guessedWf, ...guesses];
    setGuesses(newGuesses);

    if (guessedWf.name === target.warframeName) {
      setStatus("won");
      if (!playerName) return;
      saveHighScore(gameId, playerName, MAX_DAILY_ATTEMPTS - guesses.length);
    } else if (gameMode === "daily" && guesses.length > MAX_DAILY_ATTEMPTS) {
      setStatus("lost");
    }
  };

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

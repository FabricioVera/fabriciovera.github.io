import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useGetTarget, useSuggestions } from "../../../../hooks/useGameHelpers";
import { getWarframeThumbnailName, getWikiThumbnail } from "../../../../utils";
import { useGameModeStorage } from "../../../../hooks/useGameModeStorage";
import { useDailyStorage } from "../../../../hooks/useDailyStorage";
import { useHandleGuess } from "../../../../hooks/useHandleGuess";
import type { GameModeCONF } from "../../../ui/GameModeSelector/GameModeSelector";

export type GameMode = "daily" | "random";

const MAX_DAILY_ATTEMPTS = 10;

export default function useWarframedle(
  rawData: preWarframe[],
  gameId: string,
  playerName: string | null,
) {
  const [gameStatus, setGameStatus] = useState<GameStatus>("loading");
  const { gameMode, setGameModeValue } = useGameModeStorage({ gameId });
  const isHydrating = useRef(true);

  const warframes: Warframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      imageURL: getWikiThumbnail(getWarframeThumbnailName(wf.name)),
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);

  const { target, refreshTarget } = useGetTarget<Warframe>(
    gameId,
    gameMode,
    warframes,
  );
  const { suggestions } = useSuggestions<Warframe>(warframes);
  const { loadProgress, saveProgress } = useDailyStorage<Warframe>({
    gameId,
    items: warframes,
  });

  const { guesses, setGuesses, clearGuesses, handleGuess } = useHandleGuess(
    target,
    warframes,
    playerName,
    gameId,
    gameMode,
    gameStatus,
    setGameStatus,
  );

  // * ------------- Callbacks -----------

  const handleRandomReroll = useCallback(() => {
    if (gameMode !== "random") return;
    refreshTarget();
    clearGuesses();
    setGameStatus("playing");
  }, [gameMode, refreshTarget, clearGuesses, setGameStatus]);
  /**
   * Activa modo diario y lo inicializa.
   */
  const startDailyMode = useCallback(() => {
    setGameModeValue("daily");
    isHydrating.current = true;
    try {
      const saved = loadProgress();
      if (saved) {
        setGuesses(saved.guesses);
        setGameStatus(saved.status);
      } else {
        clearGuesses();
        setGameStatus("playing");
      }
    } catch (error) {
      logger.error(`Error de inicialización`, error);
      clearGuesses();
      setGameStatus("playing");
    } finally {
      // Liberamos el bloqueo en el siguiente ciclo de render
      setTimeout(() => {
        isHydrating.current = false;
      }, 0);
    }
  }, [loadProgress, setGuesses]);

  /**
   * Activa modo aleatorio y limpia intentos.
   */
  const startRandomMode = useCallback(() => {
    setGameModeValue("random");
    clearGuesses();
    setGameStatus("playing");
  }, []);

  // * --------- Effects ---------
  useEffect(() => {
    if (warframes && gameMode === "daily") {
      startDailyMode();
    }
  }, [startDailyMode, warframes]);

  useEffect(() => {
    if (
      gameMode === "daily" &&
      gameStatus !== "loading" &&
      !isHydrating.current
    ) {
      saveProgress(guesses, gameStatus);
    }
  }, [guesses, gameStatus, gameMode, saveProgress]);

  // * Variables y configuraciones derivadas
  const GameModeConfig: GameModeCONF[] = [
    {
      gameModeName: "daily",
      gameModeHook: startDailyMode,
    },
    {
      gameModeName: "random",
      gameModeHook: startRandomMode,
    },
  ];

  const guessedNames = useMemo(() => {
    return guesses.map((g) => g.name);
  }, [guesses]);

  return {
    warframes,
    guessedNames,
    target,
    suggestions,
    gameMode,
    attemptsLeft:
      gameMode === "daily" ? MAX_DAILY_ATTEMPTS - guesses.length : null,
    guesses,
    gameStatus,
    handleGuess,
    GameModeConfig,
    handleRandomReroll,
  };
}

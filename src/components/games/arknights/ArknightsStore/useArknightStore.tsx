import { create } from "zustand";
import type { OperatorDTO } from "../../../../types";
import type { GameStatus } from "../../../../types/game";
import { fetchOperators } from "../../../../lib/arknights";
import {
  calculateDailyTarget,
  calculateRandomTarget,
  calculateRandomTargetArknights,
  calculateRandomTargetArknightsAbility,
} from "../../../../utils/game";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "../../../../services/dailyStorageRepository";
import { logger } from "../../../../services/logger";
import { saveDailyScore } from "../../../../services/scoreRepository";
import { normalizeString } from "../../../../utils";

export const gameModeRepository = {
  save: (gameId: string, mode: string): void => {
    try {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Formato: gameId-GameMode=daily; expires=...; path=/
      document.cookie = `${gameId}-GameMode=${mode};expires=${endOfDay.toUTCString()};path=/`;
    } catch (error) {
      console.error("[gameModeRepository] Error al guardar la cookie:", error);
    }
  },

  load: (gameId: string): string | null => {
    try {
      const match = document.cookie.match(
        new RegExp(`(^| )${gameId}-GameMode=([^;]+)`),
      );
      return match ? match[2] : null;
    } catch (error) {
      console.error("[gameModeRepository] Error al leer la cookie:", error);
      return null;
    }
  },
};

interface ArknightsGameState {
  //* Game State
  gameId: string;
  playerName: string | null;
  gameStatus: GameStatus;
  gameMode: string;
  items: OperatorDTO[];
  target: OperatorDTO | undefined;
  guesses: OperatorDTO[];
  maxDailyAttempts: number;

  errorMessage: string | null;

  //* Actions
  init: (gameId: string, playerName: string | null) => Promise<void>;
  setGameMode: (mode: string) => void;
  guess: (name: string) => void;
  reroll: () => void;
  surrender: () => void;
}

export const useArknightStore = create<ArknightsGameState>((set, get) => ({
  gameId: "",
  playerName: null,
  gameStatus: "loading",
  gameMode: "daily",
  items: [],
  target: undefined,
  guesses: [],
  maxDailyAttempts: Infinity,

  errorMessage: null,

  init: async (gameId, playerName) => {
    set({ gameId, playerName, gameStatus: "loading" });
    try {
      const savedStatus = localStorage.getItem(`daily-state-${gameId}`);
      const isCompleted = savedStatus ? JSON.parse(savedStatus) : "";
      const status = isCompleted.status || "playing";
      const cookieGameMode = gameModeRepository.load(gameId);
      const savedMode =
        cookieGameMode || (status === "playing" ? "daily" : "random");
      const operators = await fetchOperators();

      let initialTarget;

      if (savedMode === "daily") {
        initialTarget = calculateDailyTarget(operators, gameId);
      } else {
        initialTarget =
          gameId === "arknightdle" || gameId === "arknightdlevoicelines"
            ? calculateRandomTargetArknights(operators)
            : calculateRandomTarget(operators);
      }

      let initialGuesses: OperatorDTO[] = [];
      let initialStatus: GameStatus = "playing";
      const savedState = loadDailyProgress(gameId);

      if (savedMode === "daily") {
        if (savedState) {
          initialGuesses = savedState.guesses
            .map((name: string) => operators.find((op) => op.name === name))
            .filter(Boolean) as OperatorDTO[];
          initialStatus = savedState.status;
        }
      }

      set({
        items: operators,
        gameMode: savedMode,
        target: initialTarget,
        guesses: initialGuesses,
        gameStatus: initialStatus,
      });
      logger.info("[Store] Juego inicializado correctamente");
    } catch (error) {
      logger.error("[Store] Error inicializando el juego:", error);
      set({ gameStatus: "lost" });
    }
  },

  setGameMode: (gameMode) => {
    const { items, gameId } = get();
    gameModeRepository.save(gameId, gameMode);

    const newTarget =
      gameMode === "daily"
        ? calculateDailyTarget(items, gameId)
        : gameId === "arknightdle" || gameId === "arknightdlevoicelines"
          ? calculateRandomTargetArknights(items)
          : calculateRandomTarget(items);

    let newGuesses: OperatorDTO[] = [];
    let newStatus: GameStatus = "playing";

    if (gameMode === "daily") {
      const savedState = loadDailyProgress(gameId);
      if (savedState) {
        newGuesses = savedState.guesses
          .map((name: string) => items.find((op) => op.name === name))
          .filter(Boolean) as OperatorDTO[];
        newStatus = savedState.status;
      }
    }

    set({
      gameMode: gameMode,
      target: newTarget,
      guesses: newGuesses,
      gameStatus: newStatus,
    });
  },

  guess: (name) => {
    const {
      items,
      target,
      guesses,
      gameStatus,
      gameMode,
      gameId,
      maxDailyAttempts,
      playerName,
    } = get();

    if (gameStatus !== "playing" || !target) return;

    const guessed = items.find((i) => i.name === name);
    if (!guessed || guesses.some((g) => g.name === name)) return;

    logger.info("[guess] Guardando guess...");
    const newGuesses = [guessed, ...guesses];
    logger.info("[guess] Chequeando victoria...");
    const isWin = guessed.name === target.name;

    const isLost =
      !isWin && newGuesses.length >= maxDailyAttempts && gameMode === "daily";
    const newStatus = isWin ? "won" : isLost ? "lost" : "playing";

    set({ guesses: newGuesses, gameStatus: newStatus });

    if ((isWin || isLost) && gameMode === "daily" && playerName) {
      saveDailyScore(gameId, playerName, newGuesses.length);
    }
    if (gameMode === "daily") {
      saveDailyProgress(gameId, newGuesses, newStatus);
    }
  },

  reroll: () => {
    const { gameMode, items, gameId } = get();
    if (gameMode !== "random") return;

    let newTarget;
    if (gameId === "arknightdleability") {
      newTarget = calculateRandomTargetArknightsAbility(items);
    } else {
      newTarget =
        gameId === "arknightdle" || gameId === "arknightdlevoicelines"
          ? calculateRandomTargetArknights(items)
          : calculateRandomTarget(items);
    }

    set({ target: newTarget, guesses: [], gameStatus: "playing" });
  },

  surrender: () => {
    set({ gameStatus: "lost" });
  },
}));

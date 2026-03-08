import { create } from "zustand";
import type { BaseGameEntity, GameStatus } from "../types/game";
import { type DailyGameState } from "../services/dailyStorageRepository";
import { logger } from "../services/logger";
import { saveDailyScore } from "../services/scoreRepository";

export type GameMode = "daily" | "random";
const MAX_DAILY_ATTEMPTS = 10;

interface GameState<TItem, TTarget> {
  gameId: string;
  gameMode: GameMode;
  gameStatus: GameStatus;
  maxDailyAttempts: number;

  items: TItem[];
  target?: TTarget;
  guesses: TItem[];

  init: (items: TItem[]) => void;
  setGameMode: (mode: GameMode) => void;
  guess: (name: string, playerName?: string | null) => void;
  reset: () => void;
  reroll: () => void;
  surrender: () => void;
}

interface CreateGameStoreParams<TItem, TTarget> {
  gameId: string;
  maxDailyAttempts: number;
  getTodayKey: () => string;
  saveDailyProgress: (
    gameId: string,
    guesses: TItem[],
    gameStatus: GameStatus,
  ) => void;
  loadDailyProgress: (gameId: string) => DailyGameState | null;
  generateTarget: (items: TItem[], mode: GameMode, id: string) => TTarget;
  checkWin: (guess: TItem, target: TTarget) => boolean;
}

export function createGameStore<TItem extends BaseGameEntity, TTarget>(
  config: CreateGameStoreParams<TItem, TTarget>,
) {
  return create<GameState<TItem, TTarget>>((set, get) => ({
    gameId: config.gameId,
    maxDailyAttempts: config.maxDailyAttempts,
    items: [],
    target: undefined,
    guesses: [],
    gameMode: localStorage.getItem(`${config.gameId}-GameMode`) as
      | GameMode
      | "daily",
    gameStatus: "loading",

    /**
     * * INICIALIZA EL JUEGO GENERA TARGET, CARGA EL PROGRESO DIARIO
     * @param items
     */
    init: (items) => {
      logger.info("[init] Juego Iniciado...");
      const { gameId, gameMode } = get();
      logger.info("[init] Generando Objetivo...");
      const target = config.generateTarget(items, gameMode, gameId);

      set({ items, target, gameStatus: "playing" });

      if (gameMode === "daily") {
        logger.info("[init] Cargando datos del dia...");
        const saved = config.loadDailyProgress(gameId);
        if (saved) {
          const hydratedGuesses = saved.guesses
            .map((name) => items.find((i) => i.name === name))
            .filter(Boolean) as TItem[];
          set({ guesses: hydratedGuesses, gameStatus: saved.status });
        }
      }
    },

    setGameMode: (gameMode) => {
      const { items, gameId } = get();
      logger.info("[setGameMode] Guardando modo de juego...");
      localStorage.setItem(`${gameId}-GameMode`, gameMode);
      logger.info("[setGameMode] Generando objetivo para modo de juego...");
      const target = config.generateTarget(items, gameMode, gameId);
      set({ gameMode: gameMode, guesses: [], target, gameStatus: "playing" });
      if (gameMode === "daily") {
        logger.info("[setGameMode] Cargando progreso del día...");
        const saved = config.loadDailyProgress(gameId);
        if (saved) {
          const hydratedGuesses = saved.guesses
            .map((name) => items.find((i) => i.name === name))
            .filter(Boolean) as TItem[];
          set({ guesses: hydratedGuesses, gameStatus: saved.status });
        }
      }
    },

    guess: (name, playerName) => {
      const {
        items,
        target,
        guesses,
        gameStatus,
        gameMode,
        gameId,
        maxDailyAttempts,
      } = get();
      if (gameStatus !== "playing" || !target) return;

      const guessed = items.find((i) => i.name === name);
      if (!guessed || guesses.some((g) => g.name === name)) return;

      logger.info("[guess] Guardando guess...");
      const newGuesses = [guessed, ...guesses];
      logger.info("[guess] Chequeando victoria...");
      const isWin = config.checkWin(guessed, target);

      const isLost =
        !isWin && newGuesses.length >= maxDailyAttempts && gameMode === "daily";
      const newStatus = isWin ? "won" : isLost ? "lost" : "playing";

      set({ guesses: newGuesses, gameStatus: newStatus });

      if (isWin && gameMode === "daily" && playerName) {
        logger.info("[guess] Guardando Score...");
        saveDailyScore(gameId, playerName, newGuesses.length);
      }
      if (gameMode === "daily") {
        logger.info("[guess] Guardando Progreso del día...");
        config.saveDailyProgress(gameId, newGuesses, newStatus);
      }
    },

    reroll: () => {
      const { items, gameId } = get();
      logger.info("[reroll] Rerrolleando objetivo...");
      const target = config.generateTarget(items, "random", gameId);
      set({ target, guesses: [], gameStatus: "playing" });
    },

    reset: () => set({ guesses: [], gameStatus: "playing" }),

    surrender: () => set({ gameStatus: "lost" }),
  }));
}

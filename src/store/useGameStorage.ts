import { create } from "zustand";
import type { BaseGameEntity, GameStatus } from "@types/game";
import { type DailyGameState } from "@services/dailyStorageRepository";
import { logger } from "@services/logger";
import { saveDailyScore } from "@services/scoreRepository";
import { gameModeRepository, type GameMode } from "@services/gameModeRepository";

export type { GameMode };

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
    gameMode: gameModeRepository.load(config.gameId) || "daily",
    gameStatus: "loading",

    /**
     * INICIALIZA EL JUEGO, GENERA TARGET Y CARGA EL PROGRESO DIARIO
     */
    init: (items) => {
      logger.info("[init] Juego Iniciado...");
      const { gameId } = get();
      const currentMode = gameModeRepository.load(gameId) || "daily";
      logger.info("[init] Generando Objetivo...");
      const target = config.generateTarget(items, currentMode, gameId);

      let initialGuesses: TItem[] = [];
      let initialStatus: GameStatus = "playing";

      if (currentMode === "daily") {
        logger.info("[init] Cargando datos del día...");
        const saved = config.loadDailyProgress(gameId);
        if (saved) {
          initialGuesses = saved.guesses
            .map((name) => items.find((i) => i.name === name))
            .filter(Boolean) as TItem[];
          initialStatus = saved.status;
        }
      }

      set({
        items,
        gameMode: currentMode,
        target,
        guesses: initialGuesses,
        gameStatus: initialStatus,
      });
    },

    setGameMode: (gameMode) => {
      const { items, gameId } = get();
      logger.info("[setGameMode] Guardando modo de juego...");
      gameModeRepository.save(gameId, gameMode);
      logger.info("[setGameMode] Generando objetivo para modo de juego...");
      const target = config.generateTarget(items, gameMode, gameId);

      let hydratedGuesses: TItem[] = [];
      let newStatus: GameStatus = "playing";

      if (gameMode === "daily") {
        logger.info("[setGameMode] Cargando progreso del día...");
        const saved = config.loadDailyProgress(gameId);
        if (saved) {
          hydratedGuesses = saved.guesses
            .map((name) => items.find((i) => i.name === name))
            .filter(Boolean) as TItem[];
          newStatus = saved.status;
        }
      }

      set({ gameMode, guesses: hydratedGuesses, target, gameStatus: newStatus });
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
      const newStatus: GameStatus = isWin ? "won" : isLost ? "lost" : "playing";

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
      const { items, gameId, gameMode } = get();
      if (gameMode !== "random") return;
      logger.info("[reroll] Rerrolleando objetivo...");
      const target = config.generateTarget(items, "random", gameId);
      set({ target, guesses: [], gameStatus: "playing" });
    },

    reset: () => set({ guesses: [], gameStatus: "playing" }),

    surrender: () => set({ gameStatus: "lost" }),
  }));
}

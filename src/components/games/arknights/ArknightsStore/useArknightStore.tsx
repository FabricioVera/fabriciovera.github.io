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

  //* Autocomplete State
  inputValue: string;
  filteredSuggestions: OperatorDTO[];
  selectedSuggestionIndex: number;
  selectDirection: number;
  errorMessage: string | null;

  //* Actions
  init: (gameId: string, playerName: string | null) => Promise<void>;
  setGameMode: (mode: string) => void;
  guess: (name: string) => void;
  reroll: () => void;
  surrender: () => void;

  //* Autocomplete Actions
  setInputValue: (value: string) => void;
  handleKeyDown: (key: string) => void;
  resetAutocomplete: () => void;

  getSelectedSuggestion: () => OperatorDTO | null;
  setSelectedSuggestionIndex: (index: number) => void;
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

  inputValue: "",
  filteredSuggestions: [],
  selectedSuggestionIndex: -1,
  selectDirection: -1,
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
          gameId === "arknightdle" || gameId === "arknightdlevoiceline"
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
        : gameId === "arknightdle" || gameId === "arknightdlevoiceline"
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
    get().resetAutocomplete();
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

    get().resetAutocomplete();
  },

  reroll: () => {
    const { gameMode, items, gameId } = get();
    if (gameMode !== "random") return;

    let newTarget;
    if (gameId === "arknightdleability") {
      newTarget = calculateRandomTargetArknightsAbility(items);
    } else {
      newTarget =
        gameId === "arknightdle" || gameId === "arknightdlevoiceline"
          ? calculateRandomTargetArknights(items)
          : calculateRandomTarget(items);
    }

    set({ target: newTarget, guesses: [], gameStatus: "playing" });
    get().resetAutocomplete();
  },

  surrender: () => {
    set({ gameStatus: "lost" });
  },

  setInputValue: (value) => {
    const { items, guesses, gameId } = get();

    if (!value.trim()) {
      set({
        inputValue: value,
        filteredSuggestions: [],
        selectedSuggestionIndex: -1,
        errorMessage: null,
      });
      return;
    }

    const normalizedValue = normalizeString(value);
    const normalizedGuessedNames = guesses.map((g) => normalizeString(g.name));

    let filtered = items
      .filter(
        (item) =>
          normalizeString(item.name).includes(normalizedValue) &&
          !normalizedGuessedNames.includes(normalizeString(item.name)),
      )
      .sort((a, b) => {
        const nameA = normalizeString(a.name);
        const nameB = normalizeString(b.name);
        const aStartsWith = nameA.startsWith(normalizedValue);
        const bStartsWith = nameB.startsWith(normalizedValue);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return nameA.localeCompare(nameB);
      });

    if (gameId === "arknightdleability") {
      filtered = filtered.filter((item) => item.rarity > 3);
    }

    set({
      inputValue: value,
      filteredSuggestions: filtered,
      selectedSuggestionIndex: filtered.length > 0 ? 0 : -1,
      errorMessage: null,
    });
  },

  handleKeyDown: (key) => {
    const { filteredSuggestions, selectedSuggestionIndex } = get();
    if (filteredSuggestions.length === 0) return;

    if (key === "ArrowUp") {
      set({
        selectedSuggestionIndex:
          selectedSuggestionIndex <= 0
            ? filteredSuggestions.length - 1
            : selectedSuggestionIndex - 1,
        selectDirection: -1,
      });
    } else if (key === "ArrowDown") {
      set({
        selectedSuggestionIndex:
          selectedSuggestionIndex >= filteredSuggestions.length - 1
            ? 0
            : selectedSuggestionIndex + 1,
        selectDirection: 1,
      });
    } else if (key === "Enter" && selectedSuggestionIndex >= 0) {
      const selectedName = filteredSuggestions[selectedSuggestionIndex].name;
      get().guess(selectedName);
    }
  },

  resetAutocomplete: () => {
    set({
      inputValue: "",
      filteredSuggestions: [],
      selectedSuggestionIndex: -1,
      errorMessage: null,
    });
  },

  getSelectedSuggestion: () => {
    const { filteredSuggestions, selectedSuggestionIndex } = get();
    if (selectedSuggestionIndex >= 0 && filteredSuggestions.length > 0) {
      return filteredSuggestions[selectedSuggestionIndex];
    }
    return null;
  },

  setSelectedSuggestionIndex: (index: number) => {
    set({ selectedSuggestionIndex: index });
  },
}));

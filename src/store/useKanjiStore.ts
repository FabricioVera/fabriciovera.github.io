/**
 * Store de Estado del Reto Diario con Zustand para Daily Kanji [/kanji]
 * FabricioVera / FabriGames
 * Cumple con Art. I (Determinismo), Art. II (Separación de Estado) y Art. III (Repository Pattern)
 */

import { create } from "zustand";
import n5Data from "../data/kanji/n5.json";
import type {
  KanjiN5,
  KanjiStageKey,
  KanjiStageProgress,
  InputMode,
  KanjiStats,
  KanjiDailyState,
} from "../types/kanji";
import {
  getDailyKanji,
  getPrimaryReading,
  getPrimaryRomaji,
  isAnswerCorrect,
} from "../utils/kanji";
import { convertKatakanaToHiragana } from "../utils/kanaConverter";
import { kanjiRepository } from "../services/kanjiRepository";

export const STAGE_KEYS: KanjiStageKey[] = [
  "reading",
  "meaning",
  "romaji",
  "strokes",
];

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createInitialStages(): Record<KanjiStageKey, KanjiStageProgress> {
  return {
    reading: {
      stageKey: "reading",
      stage: "reading",
      outcome: "pending",
      attempts: 0,
      attempted: false,
    },
    meaning: {
      stageKey: "meaning",
      stage: "meaning",
      outcome: "pending",
      attempts: 0,
      attempted: false,
    },
    romaji: {
      stageKey: "romaji",
      stage: "romaji",
      outcome: "pending",
      attempts: 0,
      attempted: false,
    },
    strokes: {
      stageKey: "strokes",
      stage: "strokes",
      outcome: "pending",
      attempts: 0,
      attempted: false,
    },
  };
}

export interface KanjiStoreState {
  kanjiTarget: KanjiN5 | null;
  allKanjis: KanjiN5[];
  currentStageIndex: number; // 0: reading, 1: meaning, 2: romaji, 3: strokes, 4: completed
  stages: Record<KanjiStageKey, KanjiStageProgress>;
  inputMode: InputMode;
  isFeedbackOpen: boolean;
  isCompleted: boolean;
  stats: KanjiStats;
  isLoading: boolean;
  date: string;

  // Acciones principales
  initializeDaily: (dateStr?: string) => void;
  setInputMode: (mode: InputMode) => void;
  submitAnswer: (answer: string) => { isCorrect: boolean; correctAnswer: string };
  submitStageAnswer: (answer: string) => { isCorrect: boolean; correctAnswer: string };
  advanceAfterFeedback: () => void;
  advanceToNextStage: () => void;
  completeStrokes: () => void;
}

export const useKanjiStore = create<KanjiStoreState>((set, get) => ({
  kanjiTarget: null,
  allKanjis: n5Data as unknown as KanjiN5[],
  currentStageIndex: 0,
  stages: createInitialStages(),
  inputMode: "choice",
  isFeedbackOpen: false,
  isCompleted: false,
  stats: {
    currentStreak: 0,
    maxStreak: 0,
    totalCompleted: 0,
    lastCompletedDate: null,
  },
  isLoading: true,
  date: getTodayDateString(),

  /**
   * Inicializa el reto diario cargando o restaurando el progreso incremental.
   */
  initializeDaily: (dateStr?: string) => {
    const todayDate = dateStr ?? getTodayDateString();
    const kanjiList = (n5Data as unknown as KanjiN5[]) || [];

    if (kanjiList.length === 0) {
      console.error("[useKanjiStore] El catálogo N5 está vacío");
      set({ isLoading: false });
      return;
    }

    const target = getDailyKanji(kanjiList, todayDate);
    const savedMode = kanjiRepository.getInputModePreference();
    const stats = kanjiRepository.getStats();
    const savedProgress = kanjiRepository.getDailyProgress(todayDate);

    if (savedProgress && savedProgress.stages) {
      // Restauración de partida activa del mismo día
      const isDone =
        savedProgress.isCompleted || savedProgress.currentStageIndex >= 4;

      set({
        kanjiTarget: target,
        allKanjis: kanjiList,
        currentStageIndex: savedProgress.currentStageIndex,
        stages: savedProgress.stages,
        inputMode: savedProgress.inputMode ?? savedMode,
        isFeedbackOpen: false,
        isCompleted: isDone,
        stats,
        isLoading: false,
        date: todayDate,
      });
    } else {
      // Inicialización de nuevo reto diario
      const initialStages = createInitialStages();
      const newState: KanjiDailyState = {
        date: todayDate,
        kanjiId: target.id,
        currentStageIndex: 0,
        stages: initialStages,
        inputMode: savedMode,
        isCompleted: false,
        updatedAt: new Date().toISOString(),
        streak: stats.currentStreak,
        lastPlayedDate: stats.lastCompletedDate,
      };

      kanjiRepository.saveIncrementalProgress(newState);

      set({
        kanjiTarget: target,
        allKanjis: kanjiList,
        currentStageIndex: 0,
        stages: initialStages,
        inputMode: savedMode,
        isFeedbackOpen: false,
        isCompleted: false,
        stats,
        isLoading: false,
        date: todayDate,
      });
    }
  },

  /**
   * Modifica el modo de respuesta del usuario y lo persiste.
   */
  setInputMode: (mode: InputMode) => {
    kanjiRepository.saveInputModePreference(mode);
    set({ inputMode: mode });

    // Actualiza también en el progreso diario guardado
    const { date, kanjiTarget, currentStageIndex, stages, isCompleted, stats } =
      get();
    if (kanjiTarget) {
      kanjiRepository.saveIncrementalProgress({
        date,
        kanjiId: kanjiTarget.id,
        currentStageIndex,
        stages,
        inputMode: mode,
        isCompleted,
        updatedAt: new Date().toISOString(),
        streak: stats.currentStreak,
        lastPlayedDate: stats.lastCompletedDate,
      });
    }
  },

  /**
   * Procesa la respuesta para la etapa en curso con regla estricta de 1 solo intento.
   */
  submitAnswer: (answer: string) => {
    const {
      kanjiTarget,
      currentStageIndex,
      stages,
      date,
      inputMode,
      isCompleted,
      stats,
    } = get();

    if (!kanjiTarget || isCompleted || currentStageIndex >= 4) {
      return { isCorrect: false, correctAnswer: "" };
    }

    const currentKey = STAGE_KEYS[currentStageIndex];
    const stageState = stages[currentKey];

    // Bloqueo: si la etapa ya fue intentada o respondida, no permitir reintentos
    if (stageState.attempts > 0 || stageState.outcome !== "pending") {
      return {
        isCorrect: stageState.outcome === "correct",
        correctAnswer: stageState.revealedAnswer ?? "",
      };
    }

    let isCorrect = false;
    let correctAnswer = "";

    if (currentStageIndex === 0) {
      // Etapa 0: Lectura en Hiragana
      const acceptableReadings: string[] = [];
      if (kanjiTarget.readings.kun) {
        for (const k of kanjiTarget.readings.kun) {
          acceptableReadings.push(
            k.replace(/\./g, "").replace(/^-/, "").trim()
          );
        }
      }
      if (kanjiTarget.readings.on) {
        for (const o of kanjiTarget.readings.on) {
          const cleanOn = o.replace(/\./g, "").replace(/^-/, "").trim();
          acceptableReadings.push(convertKatakanaToHiragana(cleanOn));
        }
      }
      correctAnswer = getPrimaryReading(kanjiTarget);
      if (!acceptableReadings.includes(correctAnswer)) {
        acceptableReadings.push(correctAnswer);
      }
      isCorrect = isAnswerCorrect(answer, acceptableReadings, false);
    } else if (currentStageIndex === 1) {
      // Etapa 1: Significado en Español
      correctAnswer = kanjiTarget.meanings[0];
      isCorrect = isAnswerCorrect(answer, kanjiTarget.meanings, false);
    } else if (currentStageIndex === 2) {
      // Etapa 2: Transcripción Romaji
      correctAnswer = getPrimaryRomaji(kanjiTarget);
      const acceptableRomaji = kanjiTarget.romaji && kanjiTarget.romaji.length > 0
        ? kanjiTarget.romaji
        : [correctAnswer];
      isCorrect = isAnswerCorrect(answer, acceptableRomaji, true);
    } else {
      // Etapa 3 (Trazos) se resuelve vía completeStrokes
      return { isCorrect: false, correctAnswer: "" };
    }

    const updatedProgress: KanjiStageProgress = {
      stageKey: currentKey,
      stage: currentKey,
      outcome: isCorrect ? "correct" : "incorrect",
      userAnswer: answer,
      revealedAnswer: correctAnswer,
      attempts: 1,
      attempted: true,
      completedAt: new Date().toISOString(),
    };

    const newStages = {
      ...stages,
      [currentKey]: updatedProgress,
    };

    if (isCorrect) {
      // Acierto: avanza de inmediato a la siguiente etapa
      const nextIndex = currentStageIndex + 1;
      const done = nextIndex >= 4;

      set({
        stages: newStages,
        currentStageIndex: nextIndex,
        isFeedbackOpen: false,
        isCompleted: done,
      });

      kanjiRepository.saveIncrementalProgress({
        date,
        kanjiId: kanjiTarget.id,
        currentStageIndex: nextIndex,
        stages: newStages,
        inputMode,
        isCompleted: done,
        updatedAt: new Date().toISOString(),
        streak: stats.currentStreak,
        lastPlayedDate: stats.lastCompletedDate,
      });
    } else {
      // Fallo pedagógico: muestra la solución en pantalla antes de permitir continuar
      set({
        stages: newStages,
        isFeedbackOpen: true,
      });

      kanjiRepository.saveIncrementalProgress({
        date,
        kanjiId: kanjiTarget.id,
        currentStageIndex,
        stages: newStages,
        inputMode,
        isCompleted: false,
        updatedAt: new Date().toISOString(),
        streak: stats.currentStreak,
        lastPlayedDate: stats.lastCompletedDate,
      });
    }

    return { isCorrect, correctAnswer };
  },

  /**
   * Alias de submitAnswer para compatibilidad de nomenclatura con plan.md.
   */
  submitStageAnswer: (answer: string) => {
    return get().submitAnswer(answer);
  },

  /**
   * Cierra el diálogo de feedback pedagógico y avanza a la siguiente etapa.
   */
  advanceAfterFeedback: () => {
    const {
      kanjiTarget,
      currentStageIndex,
      stages,
      date,
      inputMode,
      stats,
    } = get();

    if (!kanjiTarget) return;

    const nextIndex = currentStageIndex + 1;
    const isDone = nextIndex >= 4;

    set({
      currentStageIndex: nextIndex,
      isFeedbackOpen: false,
      isCompleted: isDone,
    });

    kanjiRepository.saveIncrementalProgress({
      date,
      kanjiId: kanjiTarget.id,
      currentStageIndex: nextIndex,
      stages,
      inputMode,
      isCompleted: isDone,
      updatedAt: new Date().toISOString(),
      streak: stats.currentStreak,
      lastPlayedDate: stats.lastCompletedDate,
    });
  },

  /**
   * Alias de advanceAfterFeedback para compatibilidad de nomenclatura con plan.md.
   */
  advanceToNextStage: () => {
    get().advanceAfterFeedback();
  },

  /**
   * Registra la finalización exitosa de la etapa de trazos caligráficos (Etapa 4).
   */
  completeStrokes: () => {
    const {
      kanjiTarget,
      stages,
      date,
      inputMode,
    } = get();

    if (!kanjiTarget) return;

    const strokesProgress: KanjiStageProgress = {
      stageKey: "strokes",
      stage: "strokes",
      outcome: "correct",
      attempts: 1,
      attempted: true,
      completedAt: new Date().toISOString(),
    };

    const newStages = {
      ...stages,
      strokes: strokesProgress,
    };

    // Evalúa si el usuario logró una partida perfecta (4/4 aciertos)
    const isPerfect = Object.values(newStages).every(
      (s) => s.outcome === "correct"
    );

    // Actualiza la racha diaria de forma idempotente en el repositorio
    const newStats = kanjiRepository.recordDailyCompletion(date, isPerfect);

    set({
      stages: newStages,
      currentStageIndex: 4,
      isCompleted: true,
      isFeedbackOpen: false,
      stats: newStats,
    });

    kanjiRepository.saveIncrementalProgress({
      date,
      kanjiId: kanjiTarget.id,
      currentStageIndex: 4,
      stages: newStages,
      inputMode,
      isCompleted: true,
      updatedAt: new Date().toISOString(),
      streak: newStats.currentStreak,
      lastPlayedDate: date,
    });
  },
}));

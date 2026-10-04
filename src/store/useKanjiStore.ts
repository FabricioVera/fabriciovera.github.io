/**
 * Store de Estado del Reto Diario con Zustand para Daily Kanji [/kanji]
 * Soporta 20 preguntas por etapa (80 retos diarios).
 * FabricioVera / FabriGames
 * Cumple con Art. I (Determinismo), Art. II (Separación de Estado) y Art. III (Repository Pattern)
 */

import { create } from "zustand";
import n5Data from "../data/kanji/n5.json";
import type {
  KanjiN5,
  KanjiStageKey,
  KanjiStageProgress,
  StageAnswerRecord,
  InputMode,
  KanjiStats,
  KanjiDailyState,
} from "../types/kanji";
import {
  getDailyKanjiList,
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

export const QUESTIONS_PER_STAGE = 20;

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
      score: 0,
      answers: [],
      isCompleted: false,
    },
    meaning: {
      stageKey: "meaning",
      stage: "meaning",
      outcome: "pending",
      attempts: 0,
      attempted: false,
      score: 0,
      answers: [],
      isCompleted: false,
    },
    romaji: {
      stageKey: "romaji",
      stage: "romaji",
      outcome: "pending",
      attempts: 0,
      attempted: false,
      score: 0,
      answers: [],
      isCompleted: false,
    },
    strokes: {
      stageKey: "strokes",
      stage: "strokes",
      outcome: "pending",
      attempts: 0,
      attempted: false,
      score: 0,
      answers: [],
      isCompleted: false,
    },
  };
}

export interface LastFeedback {
  isCorrect: boolean;
  correctAnswer: string;
  userAnswer: string;
}

export interface KanjiStoreState {
  dailyKanjis: KanjiN5[];
  kanjiTarget: KanjiN5 | null;
  allKanjis: KanjiN5[];
  currentStageIndex: number; // 0: reading, 1: meaning, 2: romaji, 3: strokes, 4: completed
  currentQuestionIndex: number; // 0..19
  stages: Record<KanjiStageKey, KanjiStageProgress>;
  inputMode: InputMode;
  isFeedbackOpen: boolean;
  lastFeedback: LastFeedback | null;
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
  completeCurrentStrokeKanji: () => void;
  completeStrokes: () => void;
}

export const useKanjiStore = create<KanjiStoreState>((set, get) => ({
  dailyKanjis: [],
  kanjiTarget: null,
  allKanjis: n5Data as unknown as KanjiN5[],
  currentStageIndex: 0,
  currentQuestionIndex: 0,
  stages: createInitialStages(),
  inputMode: "choice",
  isFeedbackOpen: false,
  lastFeedback: null,
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

    // Obtener los 20 kanjis deterministas del día
    const dailyKanjis = getDailyKanjiList(kanjiList, todayDate, QUESTIONS_PER_STAGE);
    const savedMode = kanjiRepository.getInputModePreference();
    const stats = kanjiRepository.getStats();
    const savedProgress = kanjiRepository.getDailyProgress(todayDate);

    if (savedProgress && savedProgress.stages) {
      // Restauración de partida activa del mismo día
      const isDone =
        savedProgress.isCompleted || savedProgress.currentStageIndex >= 4;

      const stageIdx = isDone ? 4 : Math.min(savedProgress.currentStageIndex, 3);
      const qIdx = isDone
        ? 0
        : Math.min(savedProgress.currentQuestionIndex ?? 0, QUESTIONS_PER_STAGE - 1);
      const activeKanji = dailyKanjis[qIdx] || dailyKanjis[0];

      set({
        dailyKanjis,
        kanjiTarget: activeKanji,
        allKanjis: kanjiList,
        currentStageIndex: stageIdx,
        currentQuestionIndex: qIdx,
        stages: savedProgress.stages,
        inputMode: savedProgress.inputMode ?? savedMode,
        isFeedbackOpen: false,
        lastFeedback: null,
        isCompleted: isDone,
        stats,
        isLoading: false,
        date: todayDate,
      });
    } else {
      // Inicialización de nuevo reto diario
      const initialStages = createInitialStages();
      const activeKanji = dailyKanjis[0];
      const newState: KanjiDailyState = {
        date: todayDate,
        kanjiId: activeKanji.id,
        kanjiIds: dailyKanjis.map((k) => k.id),
        currentStageIndex: 0,
        currentQuestionIndex: 0,
        stages: initialStages,
        inputMode: savedMode,
        isCompleted: false,
        updatedAt: new Date().toISOString(),
        streak: stats.currentStreak,
        lastPlayedDate: stats.lastCompletedDate,
      };

      kanjiRepository.saveIncrementalProgress(newState);

      set({
        dailyKanjis,
        kanjiTarget: activeKanji,
        allKanjis: kanjiList,
        currentStageIndex: 0,
        currentQuestionIndex: 0,
        stages: initialStages,
        inputMode: savedMode,
        isFeedbackOpen: false,
        lastFeedback: null,
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
    const { date, kanjiTarget, dailyKanjis, currentStageIndex, currentQuestionIndex, stages, isCompleted, stats } =
      get();
    if (kanjiTarget) {
      kanjiRepository.saveIncrementalProgress({
        date,
        kanjiId: kanjiTarget.id,
        kanjiIds: dailyKanjis.map((k) => k.id),
        currentStageIndex,
        currentQuestionIndex,
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
   * Procesa la respuesta para la pregunta activa de la etapa en curso.
   * Regla de 1 solo intento por pregunta con retroalimentación inmediata.
   */
  submitAnswer: (answer: string) => {
    const {
      dailyKanjis,
      kanjiTarget,
      currentStageIndex,
      currentQuestionIndex,
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

    // Verificar si esta pregunta específica ya fue respondida en esta etapa
    if (stageState.answers && stageState.answers.length > currentQuestionIndex) {
      const existing = stageState.answers[currentQuestionIndex];
      return {
        isCorrect: existing.isCorrect,
        correctAnswer: existing.correctAnswer,
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
      // Etapa 3 (Trazos) se resuelve vía completeCurrentStrokeKanji
      return { isCorrect: false, correctAnswer: "" };
    }

    const answerRecord: StageAnswerRecord = {
      kanjiId: kanjiTarget.id,
      kanjiCharacter: kanjiTarget.kanji,
      isCorrect,
      userAnswer: answer,
      correctAnswer,
      timestamp: new Date().toISOString(),
    };

    const newAnswers = [...(stageState.answers || []), answerRecord];
    const newScore = isCorrect ? (stageState.score || 0) + 1 : (stageState.score || 0);

    const updatedProgress: KanjiStageProgress = {
      ...stageState,
      score: newScore,
      answers: newAnswers,
      outcome: isCorrect ? "correct" : "incorrect",
      userAnswer: answer,
      revealedAnswer: correctAnswer,
      attempts: (stageState.attempts || 0) + 1,
      attempted: true,
      completedAt: new Date().toISOString(),
    };

    const newStages = {
      ...stages,
      [currentKey]: updatedProgress,
    };

    const feedbackPayload: LastFeedback = {
      isCorrect,
      correctAnswer,
      userAnswer: answer,
    };

    set({
      stages: newStages,
      isFeedbackOpen: true,
      lastFeedback: feedbackPayload,
    });

    kanjiRepository.saveIncrementalProgress({
      date,
      kanjiId: kanjiTarget.id,
      kanjiIds: dailyKanjis.map((k) => k.id),
      currentStageIndex,
      currentQuestionIndex,
      stages: newStages,
      inputMode,
      isCompleted: false,
      updatedAt: new Date().toISOString(),
      streak: stats.currentStreak,
      lastPlayedDate: stats.lastCompletedDate,
    });

    return { isCorrect, correctAnswer };
  },

  submitStageAnswer: (answer: string) => {
    return get().submitAnswer(answer);
  },

  /**
   * Cierra la retroalimentación y avanza a la siguiente pregunta o etapa.
   */
  advanceAfterFeedback: () => {
    const {
      dailyKanjis,
      currentStageIndex,
      currentQuestionIndex,
      stages,
      date,
      inputMode,
      stats,
    } = get();

    if (currentStageIndex >= 4) return;

    const currentKey = STAGE_KEYS[currentStageIndex];

    if (currentQuestionIndex < QUESTIONS_PER_STAGE - 1) {
      // Avanzar a la siguiente pregunta de la misma etapa
      const nextQ = currentQuestionIndex + 1;
      const nextKanji = dailyKanjis[nextQ];

      set({
        currentQuestionIndex: nextQ,
        kanjiTarget: nextKanji,
        isFeedbackOpen: false,
        lastFeedback: null,
      });

      kanjiRepository.saveIncrementalProgress({
        date,
        kanjiId: nextKanji.id,
        kanjiIds: dailyKanjis.map((k) => k.id),
        currentStageIndex,
        currentQuestionIndex: nextQ,
        stages,
        inputMode,
        isCompleted: false,
        updatedAt: new Date().toISOString(),
        streak: stats.currentStreak,
        lastPlayedDate: stats.lastCompletedDate,
      });
    } else {
      // Completó las 20 preguntas de la etapa actual: pasar a la siguiente etapa
      const updatedStages = {
        ...stages,
        [currentKey]: {
          ...stages[currentKey],
          isCompleted: true,
        },
      };

      const nextStageIndex = currentStageIndex + 1;
      const isDone = nextStageIndex >= 4;

      if (!isDone) {
        // Pasa a la siguiente etapa en la pregunta 0
        const firstKanjiOfNextStage = dailyKanjis[0];
        set({
          currentStageIndex: nextStageIndex,
          currentQuestionIndex: 0,
          kanjiTarget: firstKanjiOfNextStage,
          stages: updatedStages,
          isFeedbackOpen: false,
          lastFeedback: null,
          isCompleted: false,
        });

        kanjiRepository.saveIncrementalProgress({
          date,
          kanjiId: firstKanjiOfNextStage.id,
          kanjiIds: dailyKanjis.map((k) => k.id),
          currentStageIndex: nextStageIndex,
          currentQuestionIndex: 0,
          stages: updatedStages,
          inputMode,
          isCompleted: false,
          updatedAt: new Date().toISOString(),
          streak: stats.currentStreak,
          lastPlayedDate: stats.lastCompletedDate,
        });
      } else {
        // Completó las 4 etapas (80 retos)
        const totalScore =
          updatedStages.reading.score +
          updatedStages.meaning.score +
          updatedStages.romaji.score +
          updatedStages.strokes.score;
        const isPerfect = totalScore === QUESTIONS_PER_STAGE * 4;
        const newStats = kanjiRepository.recordDailyCompletion(date, isPerfect);

        set({
          currentStageIndex: 4,
          currentQuestionIndex: 0,
          stages: updatedStages,
          isFeedbackOpen: false,
          lastFeedback: null,
          isCompleted: true,
          stats: newStats,
        });

        kanjiRepository.saveIncrementalProgress({
          date,
          kanjiId: dailyKanjis[0].id,
          kanjiIds: dailyKanjis.map((k) => k.id),
          currentStageIndex: 4,
          currentQuestionIndex: 0,
          stages: updatedStages,
          inputMode,
          isCompleted: true,
          updatedAt: new Date().toISOString(),
          streak: newStats.currentStreak,
          lastPlayedDate: date,
        });
      }
    }
  },

  advanceToNextStage: () => {
    get().advanceAfterFeedback();
  },

  /**
   * Registra el kanji de trazo actual como completado en la Etapa 4 y avanza al siguiente (1..20).
   */
  completeCurrentStrokeKanji: () => {
    const {
      dailyKanjis,
      kanjiTarget,
      currentQuestionIndex,
      stages,
      date,
      inputMode,
      stats,
    } = get();

    if (!kanjiTarget) return;

    const strokeRecord: StageAnswerRecord = {
      kanjiId: kanjiTarget.id,
      kanjiCharacter: kanjiTarget.kanji,
      isCorrect: true,
      userAnswer: "completed",
      correctAnswer: kanjiTarget.kanji,
      timestamp: new Date().toISOString(),
    };

    const newAnswers = [...(stages.strokes.answers || []), strokeRecord];
    const newScore = (stages.strokes.score || 0) + 1;

    const updatedStrokes: KanjiStageProgress = {
      ...stages.strokes,
      score: newScore,
      answers: newAnswers,
      outcome: "correct",
      attempts: (stages.strokes.attempts || 0) + 1,
      attempted: true,
      completedAt: new Date().toISOString(),
    };

    const newStages = {
      ...stages,
      strokes: updatedStrokes,
    };

    if (currentQuestionIndex < QUESTIONS_PER_STAGE - 1) {
      // Avanzar al siguiente kanji para trazar
      const nextQ = currentQuestionIndex + 1;
      const nextKanji = dailyKanjis[nextQ];

      set({
        currentQuestionIndex: nextQ,
        kanjiTarget: nextKanji,
        stages: newStages,
      });

      kanjiRepository.saveIncrementalProgress({
        date,
        kanjiId: nextKanji.id,
        kanjiIds: dailyKanjis.map((k) => k.id),
        currentStageIndex: 3,
        currentQuestionIndex: nextQ,
        stages: newStages,
        inputMode,
        isCompleted: false,
        updatedAt: new Date().toISOString(),
        streak: stats.currentStreak,
        lastPlayedDate: stats.lastCompletedDate,
      });
    } else {
      // Se completaron los 20 kanjis de trazos: finalización de la partida
      const totalScore =
        newStages.reading.score +
        newStages.meaning.score +
        newStages.romaji.score +
        newScore;
      const isPerfect = totalScore === QUESTIONS_PER_STAGE * 4;
      const newStats = kanjiRepository.recordDailyCompletion(date, isPerfect);

      const finalStrokes = { ...updatedStrokes, isCompleted: true };
      const finalStages = { ...newStages, strokes: finalStrokes };

      set({
        stages: finalStages,
        currentStageIndex: 4,
        isCompleted: true,
        isFeedbackOpen: false,
        stats: newStats,
      });

      kanjiRepository.saveIncrementalProgress({
        date,
        kanjiId: kanjiTarget.id,
        kanjiIds: dailyKanjis.map((k) => k.id),
        currentStageIndex: 4,
        currentQuestionIndex: QUESTIONS_PER_STAGE - 1,
        stages: finalStages,
        inputMode,
        isCompleted: true,
        updatedAt: new Date().toISOString(),
        streak: newStats.currentStreak,
        lastPlayedDate: date,
      });
    }
  },

  /**
   * Alias de compatibilidad para completeCurrentStrokeKanji.
   */
  completeStrokes: () => {
    get().completeCurrentStrokeKanji();
  },
}));

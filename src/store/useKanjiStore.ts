/**
 * Store de Estado del Reto Diario con Zustand para Daily Kanji [/kanji]
 * Soporta 20 preguntas por etapa (80 retos diarios).
 * FabricioVera / FabriGames
 * Cumple con Art. I (Determinismo), Art. II (Separación de Estado) y Art. III (Repository Pattern)
 */

import { create } from "zustand";
import n5Data from "../data/kanji/n5.json";
import top1000Data from "../data/kanji/top1000.json";
import type {
  KanjiN5,
  KanjiItem,
  KanjiStageKey,
  KanjiStageProgress,
  StageAnswerRecord,
  InputMode,
  KanjiStats,
  KanjiDailyState,
  KanjiFontFamily,
  ReviewKanjiItem,
} from "../types/kanji";

const defaultKanjiCatalog: KanjiN5[] = ((top1000Data && top1000Data.length > 0 ? top1000Data : n5Data) as unknown) as KanjiN5[];
import {
  getDailyKanjiList,
  getPrimaryReading,
  getPrimaryRomaji,
  getDeterministicVocabWord,
  isAnswerCorrect,
} from "../utils/kanji";
import { convertKatakanaToHiragana } from "../utils/kanaConverter";
import { kanjiRepository } from "../services/kanjiRepository";

export const STAGE_KEYS: KanjiStageKey[] = [
  "reading",
  "meaning",
  "vocabulary",
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
    vocabulary: {
      stageKey: "vocabulary",
      stage: "vocabulary",
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
  selectedFont: KanjiFontFamily;
  isFeedbackOpen: boolean;
  lastFeedback: LastFeedback | null;
  isCompleted: boolean;
  stats: KanjiStats;
  reviewList: ReviewKanjiItem[];
  isLoading: boolean;
  date: string;

  // Acciones principales y de navegación libre
  initializeDaily: (dateStr?: string) => void;
  setInputMode: (mode: InputMode) => void;
  setSelectedFont: (font: KanjiFontFamily) => void;
  setCurrentStage: (stageIndex: number) => void;
  goToQuestion: (questionIndex: number) => void;
  submitAnswer: (answer: string) => { isCorrect: boolean; correctAnswer: string };
  submitStageAnswer: (answer: string) => { isCorrect: boolean; correctAnswer: string };
  advanceAfterFeedback: () => void;
  advanceToNextStage: () => void;
  completeCurrentStrokeKanji: () => void;
  completeStrokes: () => void;
  addKanjiToReview: (kanji: KanjiN5) => void;
  removeKanjiFromReview: (kanjiCharOrId: string) => void;
  clearReviewList: () => void;
}

export const useKanjiStore = create<KanjiStoreState>((set, get) => ({
  dailyKanjis: [],
  kanjiTarget: null,
  allKanjis: defaultKanjiCatalog,
  currentStageIndex: 0,
  currentQuestionIndex: 0,
  stages: createInitialStages(),
  inputMode: "choice",
  selectedFont: kanjiRepository.getFontFamilyPreference(),
  isFeedbackOpen: false,
  lastFeedback: null,
  isCompleted: false,
  stats: {
    currentStreak: 0,
    maxStreak: 0,
    totalCompleted: 0,
    lastCompletedDate: null,
  },
  reviewList: [],
  isLoading: true,
  date: getTodayDateString(),

  /**
   * Inicializa el reto diario cargando o restaurando el progreso incremental.
   */
  initializeDaily: (dateStr?: string) => {
    const todayDate = dateStr ?? getTodayDateString();
    const kanjiList = (get().allKanjis && get().allKanjis.length > 0)
      ? get().allKanjis
      : defaultKanjiCatalog;

    if (kanjiList.length === 0) {
      console.error("[useKanjiStore] El catálogo de kanjis está vacío");
      set({ isLoading: false });
      return;
    }

    // Obtener los 20 kanjis deterministas del día
    const dailyKanjis = getDailyKanjiList(kanjiList, todayDate, QUESTIONS_PER_STAGE);
    const savedMode = kanjiRepository.getInputModePreference();
    const savedFont = kanjiRepository.getFontFamilyPreference();
    const stats = kanjiRepository.getStats();
    const savedProgress = kanjiRepository.getDailyProgress(todayDate);
    const reviewList = kanjiRepository.getReviewList();

    if (savedProgress && savedProgress.stages) {
      // Restauración de partida activa del mismo día
      const isDone =
        savedProgress.isCompleted || savedProgress.currentStageIndex >= 4;

      const stageIdx = isDone ? 4 : Math.min(savedProgress.currentStageIndex, 3);
      const qIdx = isDone
        ? 0
        : Math.min(savedProgress.currentQuestionIndex ?? 0, QUESTIONS_PER_STAGE - 1);
      const activeKanji = dailyKanjis[qIdx] || dailyKanjis[0];

      const restoredStages = { ...savedProgress.stages } as Record<KanjiStageKey, KanjiStageProgress>;
      if (!restoredStages.vocabulary && (restoredStages as any).romaji) {
        restoredStages.vocabulary = {
          ...(restoredStages as any).romaji,
          stageKey: "vocabulary",
          stage: "vocabulary",
        };
      }
      if (!restoredStages.vocabulary) {
        restoredStages.vocabulary = {
          stageKey: "vocabulary",
          stage: "vocabulary",
          outcome: "pending",
          attempts: 0,
          attempted: false,
          score: 0,
          answers: [],
          isCompleted: false,
        };
      }

      set({
        dailyKanjis,
        kanjiTarget: activeKanji,
        allKanjis: kanjiList,
        currentStageIndex: stageIdx,
        currentQuestionIndex: qIdx,
        stages: restoredStages,
        inputMode: savedProgress.inputMode ?? savedMode,
        selectedFont: savedFont,
        isFeedbackOpen: false,
        lastFeedback: null,
        isCompleted: isDone,
        stats,
        reviewList,
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
        selectedFont: savedFont,
        isFeedbackOpen: false,
        lastFeedback: null,
        isCompleted: false,
        stats,
        reviewList,
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
   * Cambia la tipografía japonesa activa y la persiste.
   */
  setSelectedFont: (font: KanjiFontFamily) => {
    kanjiRepository.saveFontFamilyPreference(font);
    set({ selectedFont: font });
  },

  /**
   * Cambia de modalidad/etapa libremente (0: Lectura, 1: Significado, 2: Romaji, 3: Trazos).
   * Sitúa al usuario en el primer ejercicio pendiente de esa etapa (o 0 si ya concluyó).
   */
  setCurrentStage: (stageIndex: number) => {
    const { dailyKanjis, stages, date, inputMode, stats, isCompleted } = get();
    if (dailyKanjis.length === 0) return;

    const validStageIdx = Math.max(0, Math.min(stageIndex, 3));
    const targetStageKey = STAGE_KEYS[validStageIdx];
    const targetStage = stages[targetStageKey];

    // Buscar primera pregunta no respondida en esta etapa
    const answeredIds = new Set((targetStage?.answers || []).map((a) => a.kanjiId));
    let targetQIdx = dailyKanjis.findIndex((k) => !answeredIds.has(k.id));
    if (targetQIdx === -1) {
      targetQIdx = 0; // Todos respondidos en esta etapa: posicionar en 0 para revisión
    }

    const nextKanji = dailyKanjis[targetQIdx] || dailyKanjis[0];

    set({
      currentStageIndex: validStageIdx,
      currentQuestionIndex: targetQIdx,
      kanjiTarget: nextKanji,
      isFeedbackOpen: false,
      lastFeedback: null,
    });

    kanjiRepository.saveIncrementalProgress({
      date,
      kanjiId: nextKanji.id,
      kanjiIds: dailyKanjis.map((k) => k.id),
      currentStageIndex: validStageIdx,
      currentQuestionIndex: targetQIdx,
      stages,
      inputMode,
      isCompleted,
      updatedAt: new Date().toISOString(),
      streak: stats.currentStreak,
      lastPlayedDate: stats.lastCompletedDate,
    });
  },

  /**
   * Salto directo a un ejercicio específico (0..19) en la etapa activa.
   */
  goToQuestion: (questionIndex: number) => {
    const { dailyKanjis, currentStageIndex, stages, date, inputMode, stats, isCompleted } = get();
    if (dailyKanjis.length === 0) return;

    const validQIdx = Math.max(0, Math.min(questionIndex, QUESTIONS_PER_STAGE - 1));
    const nextKanji = dailyKanjis[validQIdx] || dailyKanjis[0];

    set({
      currentQuestionIndex: validQIdx,
      kanjiTarget: nextKanji,
      isFeedbackOpen: false,
      lastFeedback: null,
    });

    kanjiRepository.saveIncrementalProgress({
      date,
      kanjiId: nextKanji.id,
      kanjiIds: dailyKanjis.map((k) => k.id),
      currentStageIndex,
      currentQuestionIndex: validQIdx,
      stages,
      inputMode,
      isCompleted,
      updatedAt: new Date().toISOString(),
      streak: stats.currentStreak,
      lastPlayedDate: stats.lastCompletedDate,
    });
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
      // Etapa 2: Vocabulario Compuesto (Jukugo)
      const targetWord = getDeterministicVocabWord(kanjiTarget, date, currentQuestionIndex);
      correctAnswer = targetWord.meaning;
      const acceptableAnswers = [
        targetWord.meaning,
        targetWord.kana,
        targetWord.japanese,
      ];
      isCorrect = isAnswerCorrect(answer, acceptableAnswers, false);
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

    // Si la respuesta fue incorrecta, registrar automáticamente el kanji en el cuaderno de errores/repaso
    let updatedReviewList = get().reviewList;
    if (!isCorrect) {
      updatedReviewList = kanjiRepository.addKanjiToReview(kanjiTarget);
    }

    set({
      stages: newStages,
      isFeedbackOpen: true,
      lastFeedback: feedbackPayload,
      reviewList: updatedReviewList,
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
   * Si la etapa actual tiene preguntas pendientes, navega a la siguiente pendiente.
   * Si la etapa actual se completa, pasa a la siguiente etapa incompleta o declara completado si ya terminaron las 4.
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
    const currentStage = stages[currentKey];

    // En modo revisión de una etapa ya completada, avanzar a la siguiente pregunta en orden
    if (currentStage.isCompleted) {
      const nextQ = (currentQuestionIndex + 1) % QUESTIONS_PER_STAGE;
      get().goToQuestion(nextQ);
      return;
    }

    const answeredIds = new Set((currentStage.answers || []).map((a) => a.kanjiId));
    const isStageFullyAnswered = dailyKanjis.every((k) => answeredIds.has(k.id));

    if (!isStageFullyAnswered) {
      // Buscar siguiente pregunta pendiente: primero hacia adelante, luego desde el inicio
      let nextQ = -1;
      for (let i = currentQuestionIndex + 1; i < QUESTIONS_PER_STAGE; i++) {
        if (!answeredIds.has(dailyKanjis[i].id)) {
          nextQ = i;
          break;
        }
      }
      if (nextQ === -1) {
        for (let i = 0; i < currentQuestionIndex; i++) {
          if (!answeredIds.has(dailyKanjis[i].id)) {
            nextQ = i;
            break;
          }
        }
      }
      if (nextQ === -1) nextQ = 0;

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
      // La etapa actual se completó
      const updatedStages = {
        ...stages,
        [currentKey]: {
          ...stages[currentKey],
          isCompleted: true,
        },
      };

      // Verificar si las 4 etapas están completadas
      const allStagesCompleted = STAGE_KEYS.every((k) => {
        const st = updatedStages[k];
        const aIds = new Set((st?.answers || []).map((a) => a.kanjiId));
        return dailyKanjis.every((kj) => aIds.has(kj.id));
      });

      if (allStagesCompleted) {
        const totalScore =
          updatedStages.reading.score +
          updatedStages.meaning.score +
          updatedStages.vocabulary.score +
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
      } else {
        // Encontrar siguiente etapa incompleta
        let nextStageIdx = currentStageIndex;
        for (let offset = 1; offset <= 4; offset++) {
          const candidateIdx = (currentStageIndex + offset) % 4;
          const candidateKey = STAGE_KEYS[candidateIdx];
          const cAnswers = new Set((updatedStages[candidateKey]?.answers || []).map((a) => a.kanjiId));
          if (!dailyKanjis.every((kj) => cAnswers.has(kj.id))) {
            nextStageIdx = candidateIdx;
            break;
          }
        }

        const nextStageKey = STAGE_KEYS[nextStageIdx];
        const nAnswers = new Set((updatedStages[nextStageKey]?.answers || []).map((a) => a.kanjiId));
        let nextQIdx = dailyKanjis.findIndex((kj) => !nAnswers.has(kj.id));
        if (nextQIdx === -1) nextQIdx = 0;
        const firstKanjiOfNextStage = dailyKanjis[nextQIdx] || dailyKanjis[0];

        set({
          currentStageIndex: nextStageIdx,
          currentQuestionIndex: nextQIdx,
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
          currentStageIndex: nextStageIdx,
          currentQuestionIndex: nextQIdx,
          stages: updatedStages,
          inputMode,
          isCompleted: false,
          updatedAt: new Date().toISOString(),
          streak: stats.currentStreak,
          lastPlayedDate: stats.lastCompletedDate,
        });
      }
    }
  },

  advanceToNextStage: () => {
    get().advanceAfterFeedback();
  },

  /**
   * Registra el kanji de trazo actual como completado en la Etapa 4 y avanza al siguiente (1..20).
   * Si ya estaba completado, no duplica el puntaje ni registro.
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

    // En modo revisión de la etapa de trazos ya completada, avanzar a la siguiente pregunta
    if (stages.strokes.isCompleted) {
      const nextQ = (currentQuestionIndex + 1) % QUESTIONS_PER_STAGE;
      get().goToQuestion(nextQ);
      return;
    }

    const alreadyAnswered = (stages.strokes.answers || []).some(
      (a) => a.kanjiId === kanjiTarget.id
    );

    let newAnswers = stages.strokes.answers || [];
    let newScore = stages.strokes.score || 0;

    if (!alreadyAnswered) {
      const strokeRecord: StageAnswerRecord = {
        kanjiId: kanjiTarget.id,
        kanjiCharacter: kanjiTarget.kanji,
        isCorrect: true,
        userAnswer: "completed",
        correctAnswer: kanjiTarget.kanji,
        timestamp: new Date().toISOString(),
      };
      newAnswers = [...newAnswers, strokeRecord];
      newScore = newScore + 1;
    }

    const updatedStrokes: KanjiStageProgress = {
      ...stages.strokes,
      score: newScore,
      answers: newAnswers,
      outcome: "correct",
      attempts: (stages.strokes.attempts || 0) + (alreadyAnswered ? 0 : 1),
      attempted: true,
      completedAt: new Date().toISOString(),
    };

    const newStages = {
      ...stages,
      strokes: updatedStrokes,
    };

    const answeredIds = new Set(newAnswers.map((a) => a.kanjiId));
    const isStrokesFullyAnswered = dailyKanjis.every((k) => answeredIds.has(k.id));

    if (!isStrokesFullyAnswered) {
      // Buscar siguiente kanji de trazo pendiente
      let nextQ = -1;
      for (let i = currentQuestionIndex + 1; i < QUESTIONS_PER_STAGE; i++) {
        if (!answeredIds.has(dailyKanjis[i].id)) {
          nextQ = i;
          break;
        }
      }
      if (nextQ === -1) {
        for (let i = 0; i < currentQuestionIndex; i++) {
          if (!answeredIds.has(dailyKanjis[i].id)) {
            nextQ = i;
            break;
          }
        }
      }
      if (nextQ === -1) nextQ = 0;

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
      // Todos los 20 trazos finalizados
      updatedStrokes.isCompleted = true;
      newStages.strokes = updatedStrokes;

      const allStagesCompleted = STAGE_KEYS.every((k) => {
        const st = newStages[k];
        const aIds = new Set((st?.answers || []).map((a) => a.kanjiId));
        return dailyKanjis.every((kj) => aIds.has(kj.id));
      });

      if (allStagesCompleted) {
        const totalScore =
          newStages.reading.score +
          newStages.meaning.score +
          newStages.vocabulary.score +
          newStages.strokes.score;
        const isPerfect = totalScore === QUESTIONS_PER_STAGE * 4;
        const newStats = kanjiRepository.recordDailyCompletion(date, isPerfect);

        set({
          currentStageIndex: 4,
          currentQuestionIndex: 0,
          stages: newStages,
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
          stages: newStages,
          inputMode,
          isCompleted: true,
          updatedAt: new Date().toISOString(),
          streak: newStats.currentStreak,
          lastPlayedDate: date,
        });
      } else {
        // Encontrar siguiente etapa incompleta
        let nextStageIdx = 0;
        for (let offset = 1; offset <= 4; offset++) {
          const candidateIdx = (3 + offset) % 4;
          const candidateKey = STAGE_KEYS[candidateIdx];
          const cAnswers = new Set((newStages[candidateKey]?.answers || []).map((a) => a.kanjiId));
          if (!dailyKanjis.every((kj) => cAnswers.has(kj.id))) {
            nextStageIdx = candidateIdx;
            break;
          }
        }

        const nextStageKey = STAGE_KEYS[nextStageIdx];
        const nAnswers = new Set((newStages[nextStageKey]?.answers || []).map((a) => a.kanjiId));
        let nextQIdx = dailyKanjis.findIndex((kj) => !nAnswers.has(kj.id));
        if (nextQIdx === -1) nextQIdx = 0;
        const firstKanjiOfNextStage = dailyKanjis[nextQIdx] || dailyKanjis[0];

        set({
          currentStageIndex: nextStageIdx,
          currentQuestionIndex: nextQIdx,
          kanjiTarget: firstKanjiOfNextStage,
          stages: newStages,
          isFeedbackOpen: false,
          lastFeedback: null,
          isCompleted: false,
        });

        kanjiRepository.saveIncrementalProgress({
          date,
          kanjiId: firstKanjiOfNextStage.id,
          kanjiIds: dailyKanjis.map((k) => k.id),
          currentStageIndex: nextStageIdx,
          currentQuestionIndex: nextQIdx,
          stages: newStages,
          inputMode,
          isCompleted: false,
          updatedAt: new Date().toISOString(),
          streak: stats.currentStreak,
          lastPlayedDate: stats.lastCompletedDate,
        });
      }
    }
  },

  /**
   * Alias de compatibilidad para completeCurrentStrokeKanji.
   */
  completeStrokes: () => {
    get().completeCurrentStrokeKanji();
  },

  /**
   * Añade manualmente un kanji a la lista de repaso.
   */
  addKanjiToReview: (kanji: KanjiN5) => {
    const updated = kanjiRepository.addKanjiToReview(kanji);
    set({ reviewList: updated });
  },

  /**
   * Elimina un kanji de la lista de repaso.
   */
  removeKanjiFromReview: (kanjiCharOrId: string) => {
    const updated = kanjiRepository.removeKanjiFromReview(kanjiCharOrId);
    set({ reviewList: updated });
  },

  /**
   * Vacía la lista de repaso por completo.
   */
  clearReviewList: () => {
    kanjiRepository.clearReviewList();
    set({ reviewList: [] });
  },
}));

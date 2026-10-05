/**
 * Dominio de datos y contratos de tipos estrictos para Daily Kanji [/kanji]
 * FabricioVera / FabriGames — Conforme con docs/constitution.md (Art. V)
 */

export type KanjiStageKey = "reading" | "meaning" | "vocabulary" | "strokes";
export type LegacyKanjiStageKey = KanjiStageKey | "romaji";

export type StageOutcome = "correct" | "incorrect" | "pending";

/** Tipografías japonesas optimizadas para Daily Kanji */
export type KanjiFontFamily =
  | "noto-sans-jp"
  | "zen-kaku-gothic"
  | "biz-ud-gothic"
  | "klee-one"
  | "zen-maru-gothic";

export interface KanjiFontOption {
  id: KanjiFontFamily;
  name: string;
  category: string;
  className: string;
  cssFamily: string;
}

/** Alias de resultado para compatibilidad de nomenclatura */
export type LegacyStageOutcome = "success" | "failure";

export type InputMode = "choice" | "write";

/** Modos alternativos para compatibilidad con plan previo */
export type ExtendedInputMode = InputMode | "multiple_choice" | "direct_input";

export interface KanaItem {
  kana: string;
  romaji: string;
  type: "hiragana" | "katakana";
}

export interface KanjiWord {
  japanese: string;
  word?: string;
  kana: string;
  reading?: string;
  meaning: string;
}

export interface KanjiN5 {
  id: string;
  kanji: string;
  unicode: string;
  readings: {
    on: string[];
    kun: string[];
  };
  meanings: string[];
  romaji?: string[];
  words: KanjiWord[];
}

/** Alias para ítems de kanji del catálogo expandido (Jouyou / Top 1000) */
export type KanjiItem = KanjiN5;

/** Ítem del cuaderno de errores / lista de kanjis a repasar */
export interface ReviewKanjiItem {
  id: string;
  kanji: string;
  meaning: string;
  romaji: string;
  readingKana?: string;
  addedAt: string;
  mistakeCount: number;
}

/** Registro de respuesta individual para cada pregunta de una etapa (1..20) */
export interface StageAnswerRecord {
  kanjiId: string;
  kanjiCharacter: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  timestamp?: string;
}

export interface KanjiStageProgress {
  stageKey: KanjiStageKey;
  stage?: KanjiStageKey;
  outcome: StageOutcome;
  userAnswer?: string;
  revealedAnswer?: string;
  attempts: number;
  attempted?: boolean;
  completedAt?: string;
  score: number; // Aciertos sobre 20 en esta etapa
  answers: StageAnswerRecord[]; // Historial de las 20 respuestas de la etapa
  isCompleted?: boolean;
}

export interface KanjiDailyState {
  date: string; // Formato "YYYY-MM-DD"
  kanjiId?: string; // ID del kanji inicial/activo para compatibilidad
  kanjiIds: string[]; // 20 IDs ordenados deterministas del día
  currentStageIndex: number; // 0: reading, 1: meaning, 2: vocabulary, 3: strokes, 4: completed
  currentQuestionIndex: number; // 0..19 (sub-progreso de la etapa activa)
  stages: Record<KanjiStageKey, KanjiStageProgress>;
  inputMode: InputMode;
  isCompleted: boolean;
  updatedAt: string;
  streak?: number;
  lastPlayedDate?: string | null;
}

export interface KanjiStats {
  currentStreak: number;
  maxStreak: number;
  totalCompleted: number;
  lastCompletedDate?: string | null;
  totalDaysPlayed?: number;
  totalPerfectDays?: number;
  totalScoreAccumulated?: number;
}

export interface ShareResultPayload {
  date: string;
  kanji?: string;
  meaning?: string;
  streak: number;
  stageOutcomes?: [StageOutcome, StageOutcome, StageOutcome, StageOutcome];
  stageScores?: Record<KanjiStageKey, number>;
  totalScore?: number;
  maxPossibleScore?: number;
  url: string;
  grid?: string;
  dateStr?: string;
  gameUrl?: string;
}

export interface KanjiRepositoryContract {
  getDailyProgress(date: string): KanjiDailyState | null;
  saveIncrementalProgress(state: KanjiDailyState): void;
  getStats(): KanjiStats;
  updateStreakAndStats(date: string, isPerfect: boolean): KanjiStats;
  getInputModePreference(): InputMode;
  saveInputModePreference(mode: InputMode): void;
}

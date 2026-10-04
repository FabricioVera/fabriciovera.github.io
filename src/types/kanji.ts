/**
 * Dominio de datos y contratos de tipos estrictos para Daily Kanji [/kanji]
 * FabricioVera / FabriGames — Conforme con docs/constitution.md (Art. V)
 */

export type KanjiStageKey = "reading" | "meaning" | "romaji" | "strokes";

export type StageOutcome = "correct" | "incorrect" | "pending";

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

export interface KanjiStageProgress {
  stageKey: KanjiStageKey;
  stage?: KanjiStageKey;
  outcome: StageOutcome;
  userAnswer?: string;
  revealedAnswer?: string;
  attempts: number;
  attempted?: boolean;
  completedAt?: string;
}

export interface KanjiDailyState {
  date: string; // Formato "YYYY-MM-DD"
  kanjiId: string;
  currentStageIndex: number; // 0: reading, 1: meaning, 2: romaji, 3: strokes, 4: completed
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
}

export interface ShareResultPayload {
  date: string;
  kanji: string;
  meaning?: string;
  streak: number;
  stageOutcomes: [StageOutcome, StageOutcome, StageOutcome, StageOutcome];
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

/**
 * Repositorio de Persistencia Incremental en Almacenamiento Local para Daily Kanji [/kanji]
 * FabricioVera / FabriGames
 * Cumple con Art. III (Repository Pattern) y Art. IV (Resiliencia y Fallback) de docs/constitution.md
 */

import type {
  KanjiDailyState,
  KanjiStats,
  InputMode,
  KanjiFontFamily,
  KanjiRepositoryContract,
} from "../types/kanji";

export const KANJI_STORAGE_KEYS = {
  PROGRESS: "kanji_daily_progress",
  STATS: "kanji_stats",
  INPUT_MODE: "kanji_input_mode",
  FONT_FAMILY: "kanji_font_family",
} as const;

/** Almacenamiento en memoria volátil para fallback ante SSR o cuota restringida */
const inMemoryFallback: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return inMemoryFallback[key] ?? null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn(`[kanjiRepository] No se pudo leer '${key}' de localStorage:`, err);
    return inMemoryFallback[key] ?? null;
  }
}

function safeSetItem(key: string, value: string): void {
  inMemoryFallback[key] = value;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      console.warn(
        `[kanjiRepository] Falló la escritura en localStorage para '${key}', usando memoria volátil:`,
        err
      );
    }
  }
}

function safeRemoveItem(key: string): void {
  delete inMemoryFallback[key];
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignorar fallos de limpieza
    }
  }
}

/**
 * Desglosa una fecha en año, mes y día para comparaciones seguras de calendario.
 * Acepta formatos "YYYY-MM-DD" o "YYYYMMDD".
 */
export function parseDateParts(
  dateStr: string
): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const clean = dateStr.replace(/[^0-9]/g, "");
  if (clean.length !== 8) return null;
  const year = parseInt(clean.substring(0, 4), 10);
  const month = parseInt(clean.substring(4, 6), 10);
  const day = parseInt(clean.substring(6, 8), 10);
  return { year, month, day };
}

/**
 * Determina si dos fechas corresponden exactamente al mismo día calendario.
 */
export function isSameDay(dateA: string, dateB: string): boolean {
  const pA = parseDateParts(dateA);
  const pB = parseDateParts(dateB);
  if (!pA || !pB) return dateA === dateB;
  return pA.year === pB.year && pA.month === pB.month && pA.day === pB.day;
}

/**
 * Determina si previousDateStr fue exactamente el día anterior a currentDateStr.
 */
export function isYesterday(
  previousDateStr: string,
  currentDateStr: string
): boolean {
  const prev = parseDateParts(previousDateStr);
  const curr = parseDateParts(currentDateStr);
  if (!prev || !curr) return false;

  const prevUtc = Date.UTC(prev.year, prev.month - 1, prev.day);
  const currUtc = Date.UTC(curr.year, curr.month - 1, curr.day);

  // 1 día exacto = 86,400,000 milisegundos
  const diffDays = Math.round((currUtc - prevUtc) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Calcula el nuevo estado de estadísticas y racha de días consecutivos de forma pura e idempotente.
 */
export function calculateNewStats(
  currentStats: KanjiStats,
  dateStr: string,
  isPerfect: boolean = false
): KanjiStats {
  const lastDate = currentStats.lastCompletedDate;

  // Idempotencia: si ya se registró la finalización en la misma fecha, no alterar racha
  if (lastDate && isSameDay(lastDate, dateStr)) {
    return { ...currentStats };
  }

  let newCurrentStreak: number;
  if (!lastDate) {
    newCurrentStreak = 1;
  } else if (isYesterday(lastDate, dateStr)) {
    newCurrentStreak = currentStats.currentStreak + 1;
  } else {
    // Si transcurrió más de 1 día, se reinicia la racha a 1
    newCurrentStreak = 1;
  }

  const newMaxStreak = Math.max(currentStats.maxStreak, newCurrentStreak);
  const totalCompleted = currentStats.totalCompleted + 1;
  const totalDaysPlayed = (currentStats.totalDaysPlayed ?? currentStats.totalCompleted) + 1;
  const totalPerfectDays = (currentStats.totalPerfectDays ?? 0) + (isPerfect ? 1 : 0);

  return {
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    totalCompleted,
    lastCompletedDate: dateStr,
    totalDaysPlayed,
    totalPerfectDays,
  };
}

export const kanjiRepository: KanjiRepositoryContract & {
  saveStats: (stats: KanjiStats) => void;
  recordDailyCompletion: (dateStr: string, isPerfect?: boolean) => KanjiStats;
  clearDailyProgress: () => void;
} = {
  /**
   * Obtiene el progreso guardado para una fecha dada.
   * Si no existe o corresponde a otra fecha anterior, retorna null.
   */
  getDailyProgress(dateStr: string): KanjiDailyState | null {
    const raw = safeGetItem(KANJI_STORAGE_KEYS.PROGRESS);
    if (!raw) return null;

    try {
      const state = JSON.parse(raw) as KanjiDailyState;
      if (state && state.date && isSameDay(state.date, dateStr)) {
        // Garantizar valores por defecto para migración de estado a 20 ítems
        if (state.currentQuestionIndex === undefined) {
          state.currentQuestionIndex = 0;
        }
        if (!state.kanjiIds) {
          state.kanjiIds = state.kanjiId ? [state.kanjiId] : [];
        }
        if (state.stages) {
          for (const key of Object.keys(state.stages) as (keyof typeof state.stages)[]) {
            const st = state.stages[key];
            if (st) {
              if (st.score === undefined) st.score = st.outcome === "correct" ? 1 : 0;
              if (!st.answers) st.answers = [];
            }
          }
        }
        return state;
      }
      return null;
    } catch (err) {
      console.error("[kanjiRepository] Error al deserializar daily progress:", err);
      return null;
    }
  },

  /**
   * Almacena incrementalmente el estado de la partida tras cada etapa superada.
   */
  saveIncrementalProgress(state: KanjiDailyState): void {
    if (!state) return;
    try {
      safeSetItem(KANJI_STORAGE_KEYS.PROGRESS, JSON.stringify(state));
    } catch (err) {
      console.error("[kanjiRepository] Error al guardar incremental progress:", err);
    }
  },

  /**
   * Obtiene las estadísticas históricas y racha del jugador.
   */
  getStats(): KanjiStats {
    const defaultStats: KanjiStats = {
      currentStreak: 0,
      maxStreak: 0,
      totalCompleted: 0,
      lastCompletedDate: null,
      totalDaysPlayed: 0,
      totalPerfectDays: 0,
    };

    const raw = safeGetItem(KANJI_STORAGE_KEYS.STATS);
    if (!raw) return defaultStats;

    try {
      const parsed = JSON.parse(raw) as Partial<KanjiStats>;
      return {
        currentStreak: Number(parsed.currentStreak) || 0,
        maxStreak: Number(parsed.maxStreak) || 0,
        totalCompleted: Number(parsed.totalCompleted) || 0,
        lastCompletedDate: parsed.lastCompletedDate ?? null,
        totalDaysPlayed:
          Number(parsed.totalDaysPlayed) || Number(parsed.totalCompleted) || 0,
        totalPerfectDays: Number(parsed.totalPerfectDays) || 0,
      };
    } catch (err) {
      console.error("[kanjiRepository] Error al deserializar stats:", err);
      return defaultStats;
    }
  },

  /**
   * Guarda directamente el objeto de estadísticas en almacenamiento.
   */
  saveStats(stats: KanjiStats): void {
    try {
      safeSetItem(KANJI_STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (err) {
      console.error("[kanjiRepository] Error al guardar stats:", err);
    }
  },

  /**
   * Registra la finalización del reto del día actualizando la racha de forma idempotente.
   */
  recordDailyCompletion(dateStr: string, isPerfect: boolean = false): KanjiStats {
    const currentStats = this.getStats();
    const updatedStats = calculateNewStats(currentStats, dateStr, isPerfect);
    this.saveStats(updatedStats);
    return updatedStats;
  },

  /**
   * Implementación de contrato updateStreakAndStats delegada en recordDailyCompletion.
   */
  updateStreakAndStats(date: string, isPerfect: boolean = false): KanjiStats {
    return this.recordDailyCompletion(date, isPerfect);
  },

  /**
   * Obtiene la preferencia de modalidad guardada para el usuario ("choice" | "write").
   */
  getInputModePreference(): InputMode {
    const raw = safeGetItem(KANJI_STORAGE_KEYS.INPUT_MODE);
    if (raw === "write" || raw === "direct_input") {
      return "write";
    }
    return "choice";
  },

  /**
   * Guarda la preferencia seleccionada por el usuario en el toggle de modalidad.
   */
  saveInputModePreference(mode: InputMode): void {
    try {
      safeSetItem(KANJI_STORAGE_KEYS.INPUT_MODE, mode);
    } catch (err) {
      console.error("[kanjiRepository] Error al guardar input mode preference:", err);
    }
  },

  /**
   * Obtiene la preferencia tipográfica guardada (por defecto "noto-sans-jp").
   */
  getFontFamilyPreference(): KanjiFontFamily {
    const raw = safeGetItem(KANJI_STORAGE_KEYS.FONT_FAMILY) as KanjiFontFamily | null;
    const validFonts: KanjiFontFamily[] = [
      "noto-sans-jp",
      "zen-kaku-gothic",
      "biz-ud-gothic",
      "klee-one",
      "zen-maru-gothic",
    ];
    if (raw && validFonts.includes(raw)) {
      return raw;
    }
    return "noto-sans-jp";
  },

  /**
   * Guarda la tipografía japonesa seleccionada por el usuario.
   */
  saveFontFamilyPreference(font: KanjiFontFamily): void {
    try {
      safeSetItem(KANJI_STORAGE_KEYS.FONT_FAMILY, font);
    } catch (err) {
      console.error("[kanjiRepository] Error al guardar font preference:", err);
    }
  },

  /**
   * Limpia el progreso diario guardado en caso de reinicio de ciclo.
   */
  clearDailyProgress(): void {
    safeRemoveItem(KANJI_STORAGE_KEYS.PROGRESS);
  },
};

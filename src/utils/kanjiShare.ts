/**
 * Utilidades de compartir y viralidad social para Daily Kanji [/kanji]
 * Soporta formato de 20 preguntas por etapa (80 retos diarios).
 * FabricioVera / FabriGames — Conforme con docs/constitution.md (Art. IV y V)
 */

import type {
  KanjiStageKey,
  KanjiStageProgress,
  ShareResultPayload,
  StageOutcome,
} from "../types/kanji";

const STAGE_KEYS: KanjiStageKey[] = [
  "reading",
  "meaning",
  "romaji",
  "strokes",
];

/**
 * Genera la grilla de emojis basada en los puntajes de las 4 etapas.
 */
export function generateEmojiGrid(
  stages: Record<KanjiStageKey, KanjiStageProgress> | StageOutcome[]
): string {
  if (Array.isArray(stages)) {
    return stages
      .map((outcome) => (outcome === "correct" ? "🟩" : "🟥"))
      .join("");
  }

  return STAGE_KEYS.map((key) => {
    const st = stages[key];
    if (!st) return "⚪";
    // Si la etapa tiene 20 de 20 es verde brillante, si > 14 es verde, si menor es rojo/amarillo
    const score = st.score ?? (st.outcome === "correct" ? 20 : 0);
    if (score >= 18) return "🟩";
    if (score >= 12) return "🟨";
    return "🟥";
  }).join("");
}

/**
 * Construye el mensaje formateado estándar para compartir en redes sociales y mensajería.
 * Formato enriquecido para el reto de 80 preguntas:
 * 
 * FabriGames - Daily Kanji #YYYY-MM-DD
 * 🏆 Puntuación: 76/80 (95%)
 * 📖 Lectura: 19/20
 * 💡 Significado: 20/20
 * 🔤 Romaji: 18/20
 * ✍️ Trazos: 19/20
 * 🔥 Racha: 5 días
 * https://fabriciovera.github.io/kanji
 */
export function buildKanjiShareMessage(payload: ShareResultPayload): string {
  const dateStr = payload.dateStr || payload.date;
  const url =
    payload.gameUrl || payload.url || "https://fabriciovera.github.io/kanji";

  if (payload.stageScores) {
    const reading = payload.stageScores.reading ?? 0;
    const meaning = payload.stageScores.meaning ?? 0;
    const romaji = payload.stageScores.romaji ?? 0;
    const strokes = payload.stageScores.strokes ?? 0;
    const total = payload.totalScore ?? (reading + meaning + romaji + strokes);
    const max = payload.maxPossibleScore ?? 80;
    const pct = Math.round((total / max) * 100);

    return [
      `FabriGames - Daily Kanji #${dateStr}`,
      `🏆 Puntuación: ${total}/${max} (${pct}%)`,
      `📖 Lectura: ${reading}/20`,
      `💡 Significado: ${meaning}/20`,
      `🔤 Romaji: ${romaji}/20`,
      `✍️ Trazos: ${strokes}/20`,
      `🔥 Racha: ${payload.streak} ${payload.streak === 1 ? "día" : "días"}`,
      url,
    ].join("\n");
  }

  // Fallback para mensajes legacy con grid de emojis
  const meaningPart = payload.meaning ? ` (${payload.meaning})` : "";
  const grid =
    payload.grid ||
    (payload.stageOutcomes
      ? generateEmojiGrid(payload.stageOutcomes)
      : "🟩🟩🟩🟩");

  return [
    `FabriGames - Daily Kanji #${dateStr}`,
    `Kanji: ${payload.kanji || ""}${meaningPart}`,
    `Racha: ${payload.streak} días 🔥`,
    `Desempeño: ${grid}`,
    url,
  ].join("\n");
}

/**
 * Comparte el resultado diario utilizando la Web Share API si está disponible,
 * o degradando de forma elegante a WhatsApp y copiado al portapapeles.
 */
export async function shareDailyKanjiResult(
  payload: ShareResultPayload
): Promise<{ shared: boolean; method: "share" | "whatsapp" | "clipboard" }> {
  const text = buildKanjiShareMessage(payload);
  const url =
    payload.gameUrl || payload.url || "https://fabriciovera.github.io/kanji";
  const title = `FabriGames - Daily Kanji #${payload.dateStr || payload.date}`;

  // 1. Intentar Web Share API nativa (dispositivos móviles y navegadores compatibles)
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { shared: true, method: "share" };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Cancelado intencionalmente por el usuario
        return { shared: false, method: "share" };
      }
      console.warn(
        "[shareDailyKanjiResult] navigator.share falló, activando fallback:",
        err
      );
    }
  }

  // 2. Copiar texto al portapapeles como respaldo seguro
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (clipboardErr) {
      console.warn(
        "[shareDailyKanjiResult] Error al copiar al portapapeles:",
        clipboardErr
      );
    }
  }

  // 3. Abrir WhatsApp Web / App nativa con el texto codificado
  if (typeof window !== "undefined") {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      text
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    return { shared: true, method: "whatsapp" };
  }

  return { shared: false, method: "clipboard" };
}

/**
 * Copia un texto arbitrario al portapapeles de manera segura.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[copyToClipboard] Error al copiar al portapapeles:", err);
      return false;
    }
  }
  return false;
}

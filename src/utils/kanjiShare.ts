/**
 * Utilidades de compartir y viralidad social para Daily Kanji [/kanji]
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
 * Genera la grilla de 4 emojis que resumen el desempeño en las 4 etapas.
 * 🟩 = Acierto ("correct")
 * 🟥 = Fallo pedagógico ("incorrect" o no superado)
 */
export function generateEmojiGrid(
  stages: Record<KanjiStageKey, KanjiStageProgress> | StageOutcome[]
): string {
  if (Array.isArray(stages)) {
    return stages
      .map((outcome) => (outcome === "correct" ? "🟩" : "🟥"))
      .join("");
  }

  return STAGE_KEYS.map((key) =>
    stages[key]?.outcome === "correct" ? "🟩" : "🟥"
  ).join("");
}

/**
 * Construye el mensaje formateado estándar para compartir en redes sociales y mensajería.
 * Formato:
 * FabriGames - Daily Kanji #YYYY-MM-DD
 * Kanji: {kanji} ({meaning})
 * Racha: {streak} días 🔥
 * Desempeño: {grid}
 * https://fabriciovera.github.io/kanji
 */
export function buildKanjiShareMessage(payload: ShareResultPayload): string {
  const dateStr = payload.dateStr || payload.date;
  const meaningPart = payload.meaning ? ` (${payload.meaning})` : "";
  const grid =
    payload.grid ||
    (payload.stageOutcomes
      ? generateEmojiGrid(payload.stageOutcomes)
      : "🟩🟩🟩🟩");
  const url =
    payload.gameUrl || payload.url || "https://fabriciovera.github.io/kanji";

  return [
    `FabriGames - Daily Kanji #${dateStr}`,
    `Kanji: ${payload.kanji}${meaningPart}`,
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

  // 1. Intentar Web Share API nativa (típica en móviles Android/iOS y Safari)
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
        // El usuario canceló intencionalmente el diálogo nativo
        return { shared: false, method: "share" };
      }
      console.warn(
        "[shareDailyKanjiResult] navigator.share falló, activando fallback:",
        err
      );
    }
  }

  // 2. Fallback: Copiar al portapapeles
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

  // 3. Fallback: Abrir enlace directo a WhatsApp Web / App
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

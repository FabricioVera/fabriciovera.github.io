import React, { useState, useEffect } from "react";
import { useKanjiStore } from "../../../store/useKanjiStore";
import {
  generateEmojiGrid,
  buildKanjiShareMessage,
  shareDailyKanjiResult,
  copyToClipboard,
} from "../../../utils/kanjiShare";
import type { ShareResultPayload } from "../../../types/kanji";

export interface KanjiSummaryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const KanjiSummaryModal: React.FC<KanjiSummaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const stages = useKanjiStore((state) => state.stages);
  const stats = useKanjiStore((state) => state.stats);
  const date = useKanjiStore((state) => state.date);
  const isStoreCompleted = useKanjiStore((state) => state.isCompleted);

  const [internalOpen, setInternalOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Vuelve a abrir si la partida se completa en el store
  useEffect(() => {
    if (isStoreCompleted) {
      setInternalOpen(true);
    }
  }, [isStoreCompleted]);

  const shouldShow =
    isOpen !== undefined ? isOpen : isStoreCompleted && internalOpen;

  if (!shouldShow || !kanjiTarget) {
    return null;
  }

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  const grid = generateEmojiGrid(stages);
  const isPerfect = Object.values(stages).every((s) => s.outcome === "correct");

  const sharePayload: ShareResultPayload = {
    date,
    dateStr: date,
    kanji: kanjiTarget.kanji,
    meaning: kanjiTarget.meanings[0] || "",
    streak: stats.currentStreak,
    stageOutcomes: [
      stages.reading.outcome,
      stages.meaning.outcome,
      stages.romaji.outcome,
      stages.strokes.outcome,
    ],
    url: "https://fabriciovera.github.io/kanji",
    gameUrl: "https://fabriciovera.github.io/kanji",
    grid,
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const result = await shareDailyKanjiResult(sharePayload);
      if (result.method === "share" && result.shared) {
        showToast("¡Resultado compartido con éxito!");
      } else if (result.method === "whatsapp") {
        showToast("¡Enlace abierto en WhatsApp!");
      } else if (result.method === "clipboard") {
        showToast("¡Copiado al portapapeles!");
      }
    } catch (err) {
      console.error("[KanjiSummaryModal] Error al compartir:", err);
      showToast("No se pudo compartir. Intenta copiar el texto.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    const message = buildKanjiShareMessage(sharePayload);
    const success = await copyToClipboard(message);
    if (success) {
      showToast("¡Resultado copiado al portapapeles! 📋");
    } else {
      showToast("No se pudo copiar automáticamente.");
    }
  };

  const stageLabels = [
    { key: "reading", title: "Lectura", emoji: stages.reading.outcome === "correct" ? "🟩" : "🟥" },
    { key: "meaning", title: "Significado", emoji: stages.meaning.outcome === "correct" ? "🟩" : "🟥" },
    { key: "romaji", title: "Romaji", emoji: stages.romaji.outcome === "correct" ? "🟩" : "🟥" },
    { key: "strokes", title: "Trazos", emoji: stages.strokes.outcome === "correct" ? "🟩" : "🟥" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kanji-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
    >
      <div className="relative w-full max-w-md mx-auto my-auto bg-neutral-900 border border-neutral-700/90 rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col items-center gap-4 sm:gap-5 text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* Botón de Cierre Superior */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar modal de resumen"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer text-sm font-bold"
        >
          ✕
        </button>

        {/* Notificación Toast Flotante */}
        {toastMessage && (
          <div
            role="status"
            className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-500 text-neutral-950 font-bold text-xs rounded-full shadow-lg z-20 animate-bounce"
          >
            {toastMessage}
          </div>
        )}

        {/* Encabezado y Estado */}
        <div className="text-center flex flex-col items-center">
          <span
            className={`text-[11px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border ${
              isPerfect
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
            }`}
          >
            {isPerfect ? "🌟 ¡Reto Perfecto! 🌟" : "🎉 ¡Reto Diario Completado!"}
          </span>
          <h2
            id="kanji-modal-title"
            className="text-lg sm:text-xl font-bold text-neutral-100 mt-2"
          >
            Daily Kanji #{date}
          </h2>
        </div>

        {/* Kanji del Día Destacado */}
        <div className="flex flex-col items-center justify-center w-full p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center shadow-inner">
          <div
            className="text-6xl sm:text-7xl font-black text-amber-400 tracking-tight font-sans select-none drop-shadow-md"
            aria-label={`Ideograma del día: ${kanjiTarget.kanji}`}
          >
            {kanjiTarget.kanji}
          </div>
          <div className="text-sm sm:text-base font-semibold text-neutral-200 mt-1 capitalize">
            {kanjiTarget.meanings.join(", ")}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-xs text-neutral-400">
            {kanjiTarget.readings.on && kanjiTarget.readings.on.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                On: {kanjiTarget.readings.on.join(", ")}
              </span>
            )}
            {kanjiTarget.readings.kun && kanjiTarget.readings.kun.length > 0 && (
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
                Kun: {kanjiTarget.readings.kun.join(", ")}
              </span>
            )}
          </div>
        </div>

        {/* Racha y Estadísticas */}
        <div className="grid grid-cols-2 gap-3 w-full text-center">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              🔥 {stats.currentStreak}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
              Racha actual (días)
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <span className="text-xl sm:text-2xl font-black text-indigo-400">
              ⭐ {stats.maxStreak}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-medium">
              Récord histórico
            </span>
          </div>
        </div>

        {/* Desglose de las 4 Etapas y Grilla de Emojis */}
        <div className="w-full flex flex-col gap-2 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium px-1">
            <span>Desempeño de hoy:</span>
            <span className="text-sm font-mono tracking-widest">{grid}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {stageLabels.map((st) => (
              <div
                key={st.key}
                className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs"
              >
                <span className="text-neutral-300">{st.title}</span>
                <span className="text-sm" aria-label={st.emoji === "🟩" ? "Correcto" : "Incorrecto"}>
                  {st.emoji}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col w-full gap-2.5 pt-1">
          {/* Botón Principal: Toque a un amigo */}
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className="text-base">📲</span>
            <span>Toque a un amigo</span>
          </button>

          {/* Botón Secundario: Copiar Texto */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-200 font-semibold text-xs transition-all active:scale-98 cursor-pointer"
          >
            <span>📋</span>
            <span>Copiar texto</span>
          </button>

          {/* Botón Terciario: Cerrar para inspeccionar */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer text-center"
          >
            Ver tablero y respuestas
          </button>
        </div>
      </div>
    </div>
  );
};

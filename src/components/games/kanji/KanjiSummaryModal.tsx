import React, { useState, useEffect } from "react";
import { useKanjiStore, QUESTIONS_PER_STAGE } from "../../../store/useKanjiStore";
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
  const dailyKanjis = useKanjiStore((state) => state.dailyKanjis);
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

  if (!shouldShow) {
    return null;
  }

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  const readingScore = stages.reading?.score ?? 0;
  const meaningScore = stages.meaning?.score ?? 0;
  const vocabScore = stages.vocabulary?.score ?? (stages as any).romaji?.score ?? 0;
  const strokesScore = stages.strokes?.score ?? (stages.strokes?.answers?.length || 0);

  const totalScore = readingScore + meaningScore + vocabScore + strokesScore;
  const maxScore = QUESTIONS_PER_STAGE * 4; // 80 puntos
  const percentage = Math.round((totalScore / maxScore) * 100);
  const isPerfect = totalScore === maxScore;

  const stageScores = {
    reading: readingScore,
    meaning: meaningScore,
    vocabulary: vocabScore,
    strokes: strokesScore,
  };

  const grid = generateEmojiGrid(stages);

  const sharePayload: ShareResultPayload = {
    date,
    dateStr: date,
    streak: stats.currentStreak,
    stageScores,
    totalScore,
    maxPossibleScore: maxScore,
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

  const stageBreakdown = [
    { title: "Lectura", icon: "📖", score: readingScore, max: QUESTIONS_PER_STAGE },
    { title: "Significado", icon: "💡", score: meaningScore, max: QUESTIONS_PER_STAGE },
    { title: "Vocabulario", icon: "📚", score: vocabScore, max: QUESTIONS_PER_STAGE },
    { title: "Trazos", icon: "✍️", score: strokesScore, max: QUESTIONS_PER_STAGE },
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
            {isPerfect ? "🌟 ¡Puntaje Perfecto! (80/80) 🌟" : "🎉 ¡Reto Diario Completado!"}
          </span>
          <h2
            id="kanji-modal-title"
            className="text-lg sm:text-xl font-bold text-neutral-100 mt-2"
          >
            Daily Kanji #{date}
          </h2>
        </div>

        {/* Tarjeta de Puntuación Global */}
        <div className="flex flex-col items-center justify-center w-full p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-center shadow-inner">
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold">
            Puntuación Total
          </span>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 font-mono mt-1">
            {totalScore} <span className="text-xl sm:text-2xl text-neutral-500 font-normal">/ {maxScore}</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 mt-1">
            {percentage}% de precisión global
          </span>
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

        {/* Desglose de las 4 Modalidades (sobre 20 cada una) */}
        <div className="w-full flex flex-col gap-2 p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
          <span className="text-xs font-semibold text-neutral-300 px-1">
            Desglose por Modalidad:
          </span>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {stageBreakdown.map((st) => (
              <div
                key={st.title}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs"
              >
                <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                  <span>{st.icon}</span>
                  <span>{st.title}</span>
                </div>
                <span className="font-mono font-bold text-amber-300">
                  {st.score}/{st.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista visual de los 20 kanjis del día */}
        {dailyKanjis.length > 0 && (
          <div className="w-full flex flex-col gap-1.5 p-3 rounded-2xl bg-neutral-950/40 border border-neutral-800/80">
            <span className="text-[11px] text-neutral-400 font-medium px-1">
              Kanjis practicados hoy:
            </span>
            <div className="flex flex-wrap gap-1 justify-center">
              {dailyKanjis.map((k) => (
                <span
                  key={k.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-800/80 text-neutral-200 font-serif font-bold text-sm shadow-sm"
                  lang="ja"
                >
                  {k.kanji}
                </span>
              ))}
            </div>
          </div>
        )}

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
            <span>Copiar resumen</span>
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

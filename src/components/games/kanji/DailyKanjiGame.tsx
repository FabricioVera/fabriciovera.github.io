import React, { useEffect, useState } from "react";
import { useKanjiStore } from "../../../store/useKanjiStore";
import type { KanjiFontFamily, KanjiStageKey } from "../../../types/kanji";
import { KanjiProgressBar } from "./KanjiProgressBar";
import { KanjiPaginationBar } from "./KanjiPaginationBar";
import { KanjiFontSelector } from "./KanjiFontSelector";
import { KanjiModeToggle } from "./KanjiModeToggle";
import { KanjiReadingStage } from "./stages/KanjiReadingStage";
import { KanjiMeaningStage } from "./stages/KanjiMeaningStage";
import { KanjiVocabStage } from "./stages/KanjiVocabStage";
import { KanjiStrokeStage } from "./stages/KanjiStrokeStage";
import { KanjiSummaryModal } from "./KanjiSummaryModal";
import { KanaReferenceModal } from "./KanaReferenceModal";

const FONT_CLASS_MAP: Record<KanjiFontFamily, string> = {
  "noto-sans-jp": "font-noto-sans-jp",
  "zen-kaku-gothic": "font-zen-kaku",
  "biz-ud-gothic": "font-biz-ud",
  "klee-one": "font-klee-one",
  "zen-maru-gothic": "font-zen-maru",
};

export const DailyKanjiGame: React.FC = () => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const currentStageIndex = useKanjiStore((state) => state.currentStageIndex);
  const selectedFont = useKanjiStore((state) => state.selectedFont);
  const isCompleted = useKanjiStore((state) => state.isCompleted);
  const isLoading = useKanjiStore((state) => state.isLoading);
  const date = useKanjiStore((state) => state.date);
  const initializeDaily = useKanjiStore((state) => state.initializeDaily);
  const setCurrentStage = useKanjiStore((state) => state.setCurrentStage);
  const stages = useKanjiStore((state) => state.stages);
  const isFeedbackOpen = useKanjiStore((state) => state.isFeedbackOpen);
  const advanceAfterFeedback = useKanjiStore((state) => state.advanceAfterFeedback);
  const completeCurrentStrokeKanji = useKanjiStore((state) => state.completeCurrentStrokeKanji);

  // Control de modales
  const [showSummary, setShowSummary] = useState(false);
  const [showKanaModal, setShowKanaModal] = useState(false);

  // Inicialización de la partida diaria al montar el componente
  useEffect(() => {
    initializeDaily();
  }, [initializeDaily]);

  // Abre el modal de resumen automáticamente al completar el reto
  useEffect(() => {
    if (isCompleted) {
      setShowSummary(true);
    }
  }, [isCompleted]);

  const activeStage = Math.min(currentStageIndex, 3);
  const fontClass = FONT_CLASS_MAP[selectedFont] || "font-noto-sans-jp";

  // Navegación por teclado: pasar a la siguiente pregunta con Enter cuando ya se respondió
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;

      // Si el resumen final está abierto, no interferir
      if (showSummary) return;

      const state = useKanjiStore.getState();
      const currentActiveStage = Math.min(state.currentStageIndex, 3);
      const stageKeys: KanjiStageKey[] = ["reading", "meaning", "vocabulary", "strokes"];
      const currentKey = stageKeys[currentActiveStage];
      const stageProgress = state.stages[currentKey];
      const isCurrentAnswered = Boolean(
        state.kanjiTarget &&
        stageProgress?.answers?.some((a) => a.kanjiId === state.kanjiTarget?.id)
      );

      // Avanzar si el feedback está abierto o si la pregunta actual ya fue respondida (modo revisión)
      if (state.isFeedbackOpen || isCurrentAnswered) {
        e.preventDefault();
        e.stopPropagation();
        if (currentActiveStage === 3) {
          state.completeCurrentStrokeKanji();
        } else {
          state.advanceAfterFeedback();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSummary]);

  // Renderizado del spinner de carga
  if (isLoading || !kanjiTarget) {
    return (
      <div
        aria-live="polite"
        className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-4 text-neutral-300"
      >
        <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <p className="text-sm font-medium tracking-wide">
          Preparando Daily Kanji del día...
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto flex flex-col items-center gap-4 sm:gap-5 px-3 py-4 sm:py-6 ${fontClass}`}>
      {/* Barra de Navegación y Cabecera Superior */}
      <div className="w-full flex items-center justify-between px-1">
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-400 hover:text-amber-400 transition-colors"
          title="Regresar al menú principal"
        >
          <span>←</span>
          <span>FabriGames</span>
        </a>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
            #{date}
          </span>
          {isCompleted && (
            <button
              type="button"
              onClick={() => setShowSummary(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Abrir resumen del reto diario y compartir"
            >
              <span>🏆</span>
              <span>Ver Resumen</span>
            </button>
          )}
        </div>
      </div>

      {/* Título y Descripción del Juego */}
      <div className="text-center flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
          Daily Kanji
        </h1>
      </div>

      {/* Selector de Modalidades / Barra de Progreso */}
      <KanjiProgressBar
        onSelectStage={(idx) => setCurrentStage(idx)}
        selectedStageIndex={activeStage}
      />

      {/* Barra de Opciones y Accesibilidad: Toggle de Modalidad + Botón Silabario + Selector de Tipografía */}
      <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 px-1">
        <KanjiModeToggle />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKanaModal((prev) => !prev)}
            aria-expanded={showKanaModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 ${
              showKanaModal
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                : "bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-700/60 hover:border-amber-500/40"
            }`}
            title="Alternar tabla de referencia de Hiragana y Katakana"
          >
            <span className="font-bold text-amber-400">あ/ア</span>
            <span className="hidden sm:inline font-medium">Silabario</span>
          </button>
          <KanjiFontSelector />
        </div>
      </div>

      {/* Paginación de 20 Ejercicios (directamente sobre el kanji activo) */}
      <KanjiPaginationBar />

      {/* Contenedor Principal de la Modalidad Activa */}
      <main className="w-full flex justify-center transition-all duration-300">
        {activeStage === 0 && <KanjiReadingStage />}
        {activeStage === 1 && <KanjiMeaningStage />}
        {activeStage === 2 && <KanjiVocabStage />}
        {activeStage === 3 && <KanjiStrokeStage />}
      </main>

      {/* Modal de Referencia Kana */}
      <KanaReferenceModal
        isOpen={showKanaModal}
        onClose={() => setShowKanaModal(false)}
      />

      {/* Modal de Resumen y Compartir Social */}
      <KanjiSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </div>
  );
};

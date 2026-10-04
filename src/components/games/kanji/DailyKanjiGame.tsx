import React, { useEffect, useState } from "react";
import { useKanjiStore } from "../../../store/useKanjiStore";
import type { KanjiFontFamily } from "../../../types/kanji";
import { KanjiProgressBar } from "./KanjiProgressBar";
import { KanjiPaginationBar } from "./KanjiPaginationBar";
import { KanjiFontSelector } from "./KanjiFontSelector";
import { KanjiModeToggle } from "./KanjiModeToggle";
import { KanjiReadingStage } from "./stages/KanjiReadingStage";
import { KanjiMeaningStage } from "./stages/KanjiMeaningStage";
import { KanjiRomajiStage } from "./stages/KanjiRomajiStage";
import { KanjiStrokeStage } from "./stages/KanjiStrokeStage";
import { KanjiSummaryModal } from "./KanjiSummaryModal";

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

  // Control del modal de resumen
  const [showSummary, setShowSummary] = useState(false);

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
        <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-sm">
          Domina 20 kanjis en 4 modalidades diarias (80 retos evaluativos).
        </p>
      </div>

      {/* Selector de Modalidades / Barra de Progreso */}
      <KanjiProgressBar
        onSelectStage={(idx) => setCurrentStage(idx)}
        selectedStageIndex={activeStage}
      />

      {/* Barra de Opciones y Accesibilidad: Toggle de Modalidad + Selector de Tipografía */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 px-1">
        <KanjiModeToggle />
        <KanjiFontSelector />
      </div>

      {/* Paginación de 20 Ejercicios (directamente sobre el kanji activo) */}
      <KanjiPaginationBar />

      {/* Contenedor Principal de la Modalidad Activa */}
      <main className="w-full flex justify-center transition-all duration-300">
        {activeStage === 0 && <KanjiReadingStage />}
        {activeStage === 1 && <KanjiMeaningStage />}
        {activeStage === 2 && <KanjiRomajiStage />}
        {activeStage === 3 && <KanjiStrokeStage />}
      </main>

      {/* Modal de Resumen y Compartir Social */}
      <KanjiSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { useKanjiStore } from "../../../store/useKanjiStore";
import { KanjiProgressBar } from "./KanjiProgressBar";
import { KanjiModeToggle } from "./KanjiModeToggle";
import { KanjiReadingStage } from "./stages/KanjiReadingStage";
import { KanjiMeaningStage } from "./stages/KanjiMeaningStage";
import { KanjiRomajiStage } from "./stages/KanjiRomajiStage";
import { KanjiStrokeStage } from "./stages/KanjiStrokeStage";
import { KanjiSummaryModal } from "./KanjiSummaryModal";

export const DailyKanjiGame: React.FC = () => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const currentStageIndex = useKanjiStore((state) => state.currentStageIndex);
  const isCompleted = useKanjiStore((state) => state.isCompleted);
  const isLoading = useKanjiStore((state) => state.isLoading);
  const date = useKanjiStore((state) => state.date);
  const initializeDaily = useKanjiStore((state) => state.initializeDaily);

  // Control del modal de resumen
  const [showSummary, setShowSummary] = useState(false);

  // Permite inspeccionar libremente etapas ya respondidas
  const [inspectingStageIndex, setInspectingStageIndex] = useState<number | null>(null);

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

  // Si avanza a una nueva etapa durante el juego, enfocar la activa
  useEffect(() => {
    if (!isCompleted) {
      setInspectingStageIndex(null);
    }
  }, [currentStageIndex, isCompleted]);

  // Determinar qué etapa se está visualizando en pantalla
  const activeViewIndex =
    inspectingStageIndex !== null
      ? inspectingStageIndex
      : Math.min(currentStageIndex, 3);

  const isInspectingPrevious =
    inspectingStageIndex !== null && inspectingStageIndex !== currentStageIndex;

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
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 sm:gap-6 px-3 py-4 sm:py-6">
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
          Aprende y domina un nuevo kanji cada día en 4 etapas interactivas.
        </p>
      </div>

      {/* Barra de Progreso de las 4 Etapas */}
      <KanjiProgressBar
        onSelectStage={(idx) => setInspectingStageIndex(idx)}
        selectedStageIndex={activeViewIndex}
      />

      {/* Selector de Modo de Entrada (Múltiple vs Escritura) */}
      <KanjiModeToggle />

      {/* Aviso contextual cuando se revisa una etapa anterior */}
      {isInspectingPrevious && (
        <div className="w-full max-w-lg flex items-center justify-between px-3 py-1.5 rounded-xl bg-neutral-800/70 border border-neutral-700 text-xs text-neutral-300 animate-fadeIn">
          <span>Modo revisión: Etapa ya respondida.</span>
          <button
            type="button"
            onClick={() => setInspectingStageIndex(null)}
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            Volver a etapa activa
          </button>
        </div>
      )}

      {/* Contenedor Principal de la Etapa Evaluativa Activa */}
      <main className="w-full flex justify-center transition-all duration-300">
        {activeViewIndex === 0 && <KanjiReadingStage />}
        {activeViewIndex === 1 && <KanjiMeaningStage />}
        {activeViewIndex === 2 && <KanjiRomajiStage />}
        {activeViewIndex === 3 && <KanjiStrokeStage />}
      </main>

      {/* Modal de Resumen y Compartir Social */}
      <KanjiSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </div>
  );
};

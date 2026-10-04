import React from "react";
import { useKanjiStore } from "../../../store/useKanjiStore";
import type { InputMode } from "../../../types/kanji";

export interface KanjiModeToggleProps {
  className?: string;
}

export const KanjiModeToggle: React.FC<KanjiModeToggleProps> = ({
  className = "",
}) => {
  const inputMode = useKanjiStore((state) => state.inputMode);
  const setInputMode = useKanjiStore((state) => state.setInputMode);
  const currentStageIndex = useKanjiStore((state) => state.currentStageIndex);
  const isCompleted = useKanjiStore((state) => state.isCompleted);

  // En la Etapa 4 (índice 3: Trazos), la interacción es siempre con el lienzo táctil
  const isStrokesStage = currentStageIndex === 3 && !isCompleted;

  if (isStrokesStage) {
    return (
      <div
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/60 border border-neutral-700/60 text-neutral-300 text-xs shadow-sm ${className}`}
        aria-label="Modalidad actual: Lienzo interactivo"
      >
        <svg
          className="w-4 h-4 text-amber-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        <span className="font-medium">Lienzo Interactivo de Caligrafía</span>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Selector de modalidad de respuesta"
      className={`inline-flex items-center p-1 rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-inner backdrop-blur-sm ${className}`}
    >
      {/* Botón Opción Múltiple */}
      <button
        type="button"
        onClick={() => setInputMode("choice")}
        aria-pressed={inputMode === "choice"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
          inputMode === "choice"
            ? "bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20"
            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
        }`}
      >
        {/* Icono de Selección Múltiple */}
        <svg
          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Múltiple</span>
      </button>

      {/* Botón Escritura Directa */}
      <button
        type="button"
        onClick={() => setInputMode("write")}
        aria-pressed={inputMode === "write"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
          inputMode === "write"
            ? "bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20"
            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
        }`}
      >
        {/* Icono de Teclado / Escritura */}
        <svg
          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10" />
        </svg>
        <span>Escritura</span>
      </button>
    </div>
  );
};

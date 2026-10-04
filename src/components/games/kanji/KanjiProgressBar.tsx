import React from "react";
import { useKanjiStore, STAGE_KEYS } from "../../../store/useKanjiStore";
import type { KanjiStageKey, StageOutcome } from "../../../types/kanji";

interface StageMetadata {
  key: KanjiStageKey;
  stepNumber: number;
  title: string;
  shortTitle: string;
  icon: string;
}

const STAGES_META: StageMetadata[] = [
  {
    key: "reading",
    stepNumber: 1,
    title: "Lectura",
    shortTitle: "Lect.",
    icon: "あ",
  },
  {
    key: "meaning",
    stepNumber: 2,
    title: "Significado",
    shortTitle: "Sign.",
    icon: "📖",
  },
  {
    key: "romaji",
    stepNumber: 3,
    title: "Romaji",
    shortTitle: "Rom.",
    icon: "abc",
  },
  {
    key: "strokes",
    stepNumber: 4,
    title: "Trazos",
    shortTitle: "Trazo",
    icon: "✍️",
  },
];

export interface KanjiProgressBarProps {
  className?: string;
  onSelectStage?: (index: number) => void;
  selectedStageIndex?: number;
}

export const KanjiProgressBar: React.FC<KanjiProgressBarProps> = ({
  className = "",
  onSelectStage,
  selectedStageIndex,
}) => {
  const currentStageIndex = useKanjiStore((state) => state.currentStageIndex);
  const stages = useKanjiStore((state) => state.stages);
  const isCompleted = useKanjiStore((state) => state.isCompleted);
  const stats = useKanjiStore((state) => state.stats);

  const streak = stats?.currentStreak ?? 0;

  return (
    <header
      className={`w-full max-w-xl mx-auto flex flex-col gap-2 p-2 sm:p-3 bg-neutral-900/70 border border-neutral-800 rounded-2xl backdrop-blur-md shadow-lg ${className}`}
      aria-label="Progreso del reto diario"
    >
      {/* Barra superior: Título del reto y contador de Racha */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
            Reto Diario
          </span>
          {isCompleted && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Completado
            </span>
          )}
        </div>

        {/* Contador de Racha */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 font-medium text-xs transition-transform hover:scale-105"
          title={`Racha actual: ${streak} días consecutivos`}
        >
          <span role="img" aria-label="fuego de racha" className="text-sm">
            🔥
          </span>
          <span className="font-bold">{streak}</span>
          <span className="text-neutral-400 hidden xs:inline">
            {streak === 1 ? "día" : "días"}
          </span>
        </div>
      </div>

      {/* Grid de las 4 etapas */}
      <nav aria-label="Etapas del reto" className="w-full">
        <ol className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {STAGES_META.map((meta, idx) => {
            const stageProgress = stages[meta.key];
            const outcome: StageOutcome = stageProgress?.outcome ?? "pending";
            const isCurrent = currentStageIndex === idx && !isCompleted;
            const isSelected = selectedStageIndex === idx;
            const isClickable =
              Boolean(onSelectStage) &&
              (isCompleted || outcome !== "pending" || isCurrent);

            let statusStyles = "";
            let outcomeIcon = meta.icon;

            if (outcome === "correct") {
              statusStyles =
                "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-emerald-900/30";
              outcomeIcon = "🟩";
            } else if (outcome === "incorrect") {
              statusStyles =
                "bg-rose-950/60 border-rose-500 text-rose-300 shadow-rose-900/30";
              outcomeIcon = "🟥";
            } else if (isCurrent) {
              statusStyles =
                "bg-amber-950/40 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-amber-900/30 scale-[1.02]";
            } else {
              // Pendiente
              statusStyles =
                "bg-neutral-900/40 border-neutral-800 text-neutral-500 opacity-60";
            }

            if (isSelected) {
              statusStyles += " ring-2 ring-amber-400 border-amber-400";
            }

            return (
              <li
                key={meta.key}
                aria-current={isCurrent ? "step" : undefined}
                className="list-none"
              >
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onSelectStage?.(idx)}
                  className={`w-full flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border text-center transition-all duration-200 ${statusStyles} ${
                    isClickable
                      ? "cursor-pointer hover:brightness-110 active:scale-95"
                      : "cursor-default"
                  }`}
                  title={
                    isClickable
                      ? `Revisar etapa ${meta.stepNumber}: ${meta.title}`
                      : `Etapa ${meta.stepNumber}: Pendiente`
                  }
                >
                  {/* Indicador superior con paso o emoji */}
                  <div className="flex items-center justify-center h-5 text-xs font-bold">
                    {outcome === "correct" || outcome === "incorrect" ? (
                      <span className="text-xs" aria-hidden="true">
                        {outcomeIcon}
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] font-mono ${
                          isCurrent
                            ? "text-amber-300 font-extrabold"
                            : "text-neutral-400"
                        }`}
                      >
                        #{meta.stepNumber}
                      </span>
                    )}
                  </div>

                  {/* Etiqueta de la etapa (responsive) */}
                  <div className="mt-0.5 font-medium leading-tight">
                    <span className="hidden sm:inline text-xs">{meta.title}</span>
                    <span className="sm:hidden text-[10px] tracking-tight">
                      {meta.shortTitle}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
};

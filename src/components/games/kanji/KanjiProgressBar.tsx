import React from "react";
import { useKanjiStore, STAGE_KEYS, QUESTIONS_PER_STAGE } from "../../../store/useKanjiStore";
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
  const currentQuestionIndex = useKanjiStore((state) => state.currentQuestionIndex);
  const stages = useKanjiStore((state) => state.stages);
  const isCompleted = useKanjiStore((state) => state.isCompleted);
  const stats = useKanjiStore((state) => state.stats);
  const setCurrentStage = useKanjiStore((state) => state.setCurrentStage);

  const streak = stats?.currentStreak ?? 0;
  const activeStageIdx = selectedStageIndex !== undefined ? selectedStageIndex : Math.min(currentStageIndex, 3);
  const activeKey = STAGE_KEYS[activeStageIdx];
  const activeStage = stages[activeKey];

  return (
    <header
      className={`w-full max-w-xl mx-auto flex flex-col gap-2.5 p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl backdrop-blur-md shadow-lg ${className}`}
      aria-label="Progreso del reto diario"
    >
      {/* Barra superior: Título del reto y contador de Racha */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
            Reto Diario • 20 por Etapa
          </span>
          {isCompleted && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Completado (80/80)
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
            const isStageDone =
              stageProgress?.isCompleted ||
              (stageProgress?.answers?.length ?? 0) >= QUESTIONS_PER_STAGE;
            const isCurrent = activeStageIdx === idx;
            const score = stageProgress?.score ?? 0;
            const answersCount = stageProgress?.answers?.length ?? 0;

            let statusStyles = "";

            if (isCurrent) {
              statusStyles =
                "bg-amber-950/40 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-amber-900/30 scale-[1.02]";
            } else if (isStageDone) {
              statusStyles =
                "bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-emerald-900/30";
            } else if (answersCount > 0) {
              statusStyles =
                "bg-neutral-800/80 border-neutral-700 text-neutral-300";
            } else {
              // Pendiente
              statusStyles =
                "bg-neutral-900/40 border-neutral-800 text-neutral-400";
            }

            return (
              <li
                key={meta.key}
                aria-current={isCurrent ? "step" : undefined}
                className="list-none"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectStage) {
                      onSelectStage(idx);
                    } else {
                      setCurrentStage(idx);
                    }
                  }}
                  className={`w-full flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-95 ${statusStyles}`}
                  title={`Modalidad ${meta.stepNumber}: ${meta.title} (${answersCount}/${QUESTIONS_PER_STAGE} contestadas • ${score} aciertos)`}
                >
                  {/* Indicador superior con paso o puntaje */}
                  <div className="flex items-center justify-center h-5 text-xs font-bold font-mono">
                    {isStageDone ? (
                      <span className="text-[11px] text-emerald-300 font-bold">
                        {score}/{QUESTIONS_PER_STAGE}
                      </span>
                    ) : answersCount > 0 ? (
                      <span className="text-[11px] text-amber-200">
                        {answersCount}/{QUESTIONS_PER_STAGE}
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] ${
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

      {/* Barra de Sub-progreso de la Etapa Activa (1 a 20) */}
      {!isCompleted && currentStageIndex < 4 && (
        <div className="w-full flex flex-col gap-1.5 pt-1 px-1 border-t border-neutral-800/80 text-xs">
          <div className="flex items-center justify-between text-neutral-300">
            <span className="font-medium text-amber-300">
              Pregunta {currentQuestionIndex + 1} de {QUESTIONS_PER_STAGE}
            </span>
            <span className="font-mono text-neutral-400">
              Aciertos: <strong className="text-emerald-400">{activeStage?.score ?? 0}</strong> / {QUESTIONS_PER_STAGE}
            </span>
          </div>

          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, ((currentQuestionIndex + 1) / QUESTIONS_PER_STAGE) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
};

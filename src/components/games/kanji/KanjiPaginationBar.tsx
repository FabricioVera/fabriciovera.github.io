import React from "react";
import { useKanjiStore, STAGE_KEYS, QUESTIONS_PER_STAGE } from "../../../store/useKanjiStore";

export interface KanjiPaginationBarProps {
  className?: string;
}

export const KanjiPaginationBar: React.FC<KanjiPaginationBarProps> = ({ className = "" }) => {
  const dailyKanjis = useKanjiStore((state) => state.dailyKanjis);
  const currentStageIndex = useKanjiStore((state) => state.currentStageIndex);
  const currentQuestionIndex = useKanjiStore((state) => state.currentQuestionIndex);
  const stages = useKanjiStore((state) => state.stages);
  const goToQuestion = useKanjiStore((state) => state.goToQuestion);

  const activeStageKey = STAGE_KEYS[Math.min(currentStageIndex, 3)];
  const currentStage = stages[activeStageKey];
  const answers = currentStage?.answers || [];

  if (!dailyKanjis || dailyKanjis.length === 0) return null;

  return (
    <nav
      aria-label="Paginación de los 20 ejercicios"
      className={`w-full max-w-xl mx-auto flex flex-col items-center gap-1.5 p-2.5 sm:p-3 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl backdrop-blur-sm ${className}`}
    >
      <div className="w-full flex items-center justify-between px-1 text-[11px] text-neutral-400">
        <span className="font-semibold text-neutral-300">
          Ejercicios (1-{QUESTIONS_PER_STAGE})
        </span>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Acierto
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Fallo
          </span>
          <span className="flex items-center gap-1 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-neutral-700 inline-block" /> Pendiente
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-10 gap-1 sm:gap-1.5">
        {Array.from({ length: QUESTIONS_PER_STAGE }, (_, i) => {
          const kanji = dailyKanjis[i];
          const answerRecord = kanji
            ? answers.find((a) => a.kanjiId === kanji.id)
            : undefined;

          const isAnswered = Boolean(answerRecord);
          const isCorrect = answerRecord?.isCorrect;
          const isActive = i === currentQuestionIndex;

          let colorStyles = "";
          if (isAnswered) {
            if (isCorrect) {
              colorStyles =
                "bg-emerald-950/80 text-emerald-300 border-emerald-500/70 hover:bg-emerald-900";
            } else {
              colorStyles =
                "bg-rose-950/80 text-rose-300 border-rose-500/70 hover:bg-rose-900";
            }
          } else {
            colorStyles =
              "bg-neutral-900/90 text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-neutral-200";
          }

          if (isActive) {
            colorStyles += " ring-2 ring-amber-400 border-amber-400 text-amber-200 scale-105 z-10 font-black shadow-md";
          }

          const statusTooltip = isAnswered
            ? isCorrect
              ? `Ejercicio #${i + 1} (${kanji?.kanji}): Acierto`
              : `Ejercicio #${i + 1} (${kanji?.kanji}): Fallo`
            : `Ejercicio #${i + 1} (${kanji?.kanji}): Pendiente`;

          return (
            <button
              key={`page-btn-${i}`}
              type="button"
              onClick={() => goToQuestion(i)}
              className={`h-8 sm:h-9 flex items-center justify-center rounded-lg border text-xs font-mono font-bold transition-all duration-150 cursor-pointer select-none active:scale-95 ${colorStyles}`}
              title={statusTooltip}
              aria-label={statusTooltip}
              aria-current={isActive ? "page" : undefined}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

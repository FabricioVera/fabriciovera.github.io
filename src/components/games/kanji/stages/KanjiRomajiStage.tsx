import React, { useState, useEffect, useMemo } from "react";
import { useKanjiStore, QUESTIONS_PER_STAGE } from "../../../../store/useKanjiStore";
import { getRomajiOptions } from "../../../../utils/kanji";

export const KanjiRomajiStage: React.FC = () => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const allKanjis = useKanjiStore((state) => state.allKanjis);
  const date = useKanjiStore((state) => state.date);
  const currentQuestionIndex = useKanjiStore((state) => state.currentQuestionIndex);
  const stageProgress = useKanjiStore((state) => state.stages.romaji);
  const inputMode = useKanjiStore((state) => state.inputMode);
  const isFeedbackOpen = useKanjiStore((state) => state.isFeedbackOpen);
  const lastFeedback = useKanjiStore((state) => state.lastFeedback);
  const submitAnswer = useKanjiStore((state) => state.submitAnswer);
  const advanceAfterFeedback = useKanjiStore((state) => state.advanceAfterFeedback);

  const [inputText, setInputText] = useState("");

  // Limpiar el campo de texto cuando cambia la pregunta activa
  useEffect(() => {
    setInputText("");
  }, [currentQuestionIndex, kanjiTarget]);

  // Verificar si la pregunta actual ya fue respondida
  const currentAnswer = stageProgress.answers?.[currentQuestionIndex];
  const hasAttempted = isFeedbackOpen || Boolean(currentAnswer);

  // Generación determinista de 4 opciones de romaji para el kanji actual
  const options = useMemo(() => {
    if (!kanjiTarget || allKanjis.length === 0) return [];
    return getRomajiOptions(kanjiTarget, allKanjis, date);
  }, [kanjiTarget, allKanjis, date]);

  if (!kanjiTarget) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-400">
        Cargando kanji...
      </div>
    );
  }

  const handleChoiceClick = (choice: string) => {
    if (hasAttempted) return;
    submitAnswer(choice);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAttempted || !inputText.trim()) return;
    submitAnswer(inputText.trim());
  };

  const isLastQuestion = currentQuestionIndex >= QUESTIONS_PER_STAGE - 1;

  return (
    <section
      aria-label="Etapa 3: Transcripción Romaji del Kanji"
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-5 p-4 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-xl backdrop-blur-md"
    >
      {/* Encabezado de la etapa */}
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Etapa 3 • Romaji ({currentQuestionIndex + 1} de {QUESTIONS_PER_STAGE})
        </span>
        <h2 className="mt-2 text-base sm:text-lg font-bold text-neutral-100">
          ¿Cuál es la transcripción en Romaji?
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Escribe o selecciona la lectura romanizada Hepburn estándar.
        </p>
      </div>

      {/* Tarjeta Visual del Kanji */}
      <div className="relative flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-neutral-950/80 border-2 border-neutral-800/90 shadow-inner group">
        <span
          className="text-6xl sm:text-7xl font-bold font-serif text-neutral-50 select-none tracking-normal"
          lang="ja"
        >
          {kanjiTarget.kanji}
        </span>
        <span className="absolute bottom-2 text-[10px] font-mono text-neutral-400">
          {kanjiTarget.unicode}
        </span>
      </div>

      {/* Contenido interactivo: opciones o escritura */}
      {!hasAttempted && (
        <div className="w-full">
          {inputMode === "choice" ? (
            /* Modo Selección Múltiple */
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
              {options.map((opt, idx) => (
                <button
                  key={`${opt}-${idx}`}
                  type="button"
                  onClick={() => handleChoiceClick(opt)}
                  disabled={hasAttempted}
                  className="flex items-center justify-center text-center min-h-[48px] px-3 py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-400/60 text-sm sm:text-base font-semibold lowercase text-neutral-100 transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            /* Modo Escritura Directa */
            <form onSubmit={handleInputSubmit} className="flex flex-col gap-2.5 w-full">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe en romaji (ej. yama, ki)..."
                  disabled={hasAttempted}
                  autoFocus
                  className="flex-1 px-4 py-3 bg-neutral-950/90 border border-neutral-700 focus:border-amber-400 rounded-xl text-neutral-100 placeholder-neutral-500 font-mono text-sm outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || hasAttempted}
                  className="py-3 px-5 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all duration-150 active:scale-95 cursor-pointer disabled:cursor-not-allowed shadow-md"
                >
                  Enviar
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Retroalimentación didáctica inmediata y botón siguiente */}
      {hasAttempted && (
        <div
          role="alert"
          className={`w-full p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all animate-fadeIn ${
            lastFeedback?.isCorrect || currentAnswer?.isCorrect
              ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/80 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>{lastFeedback?.isCorrect || currentAnswer?.isCorrect ? "✅ ¡Correcto!" : "❌ Respuesta incorrecta"}</span>
          </div>

          <p className="text-xs text-center text-neutral-300">
            Transcripción correcta:{" "}
            <strong className="text-amber-300 font-bold font-mono text-sm ml-1">
              {lastFeedback?.correctAnswer || currentAnswer?.correctAnswer}
            </strong>
          </p>

          <button
            type="button"
            onClick={advanceAfterFeedback}
            className="w-full mt-1 py-2.5 px-4 bg-neutral-100 hover:bg-white text-neutral-900 font-extrabold rounded-xl text-xs sm:text-sm tracking-wide transition-all active:scale-98 cursor-pointer shadow-md"
          >
            {isLastQuestion ? "Completar Etapa de Romaji →" : `Siguiente pregunta (${currentQuestionIndex + 2}/${QUESTIONS_PER_STAGE}) →`}
          </button>
        </div>
      )}
    </section>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import { useKanjiStore, QUESTIONS_PER_STAGE } from "../../../../store/useKanjiStore";
import { getReadingOptions } from "../../../../utils/kanji";
import { convertRomajiToHiragana } from "../../../../utils/kanaConverter";

export const KanjiReadingStage: React.FC = () => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const allKanjis = useKanjiStore((state) => state.allKanjis);
  const date = useKanjiStore((state) => state.date);
  const currentQuestionIndex = useKanjiStore((state) => state.currentQuestionIndex);
  const stageProgress = useKanjiStore((state) => state.stages.reading);
  const inputMode = useKanjiStore((state) => state.inputMode);
  const isFeedbackOpen = useKanjiStore((state) => state.isFeedbackOpen);
  const lastFeedback = useKanjiStore((state) => state.lastFeedback);
  const submitAnswer = useKanjiStore((state) => state.submitAnswer);
  const advanceAfterFeedback = useKanjiStore((state) => state.advanceAfterFeedback);

  const [inputText, setInputText] = useState("");

  // Limpiar el campo de texto cuando cambia la pregunta
  useEffect(() => {
    setInputText("");
  }, [currentQuestionIndex, kanjiTarget]);

  // Verificar si la pregunta actual ya fue respondida
  const currentAnswer = stageProgress.answers?.find(
    (a) => a.kanjiId === kanjiTarget.id
  );
  const hasAttempted = isFeedbackOpen || Boolean(currentAnswer);
  const answeredRecord = currentAnswer || (lastFeedback ? {
    userAnswer: lastFeedback.userAnswer,
    correctAnswer: lastFeedback.correctAnswer,
    isCorrect: lastFeedback.isCorrect,
  } : null);

  // Generación determinista de 4 opciones de lectura para el kanji actual
  const options = useMemo(() => {
    if (!kanjiTarget || allKanjis.length === 0) return [];
    return getReadingOptions(kanjiTarget, allKanjis, date);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const converted = convertRomajiToHiragana(e.target.value);
    setInputText(converted);
  };

  const isLastQuestion = currentQuestionIndex >= QUESTIONS_PER_STAGE - 1;

  return (
    <section
      aria-label="Etapa 1: Lectura del Kanji"
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-xl backdrop-blur-md"
    >
      {/* Encabezado de la etapa */}
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Etapa 1 • Lectura ({currentQuestionIndex + 1} de {QUESTIONS_PER_STAGE})
        </span>
        <h2 className="mt-2 text-base sm:text-lg font-bold text-neutral-100">
          ¿Cuál es la lectura en Hiragana?
        </h2>
      </div>

      {/* Tarjeta Visual del Kanji */}
      <div className="relative flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-neutral-950/80 border-2 border-neutral-800/90 shadow-inner group">
        <span
          className="text-6xl sm:text-7xl font-bold text-neutral-50 select-none tracking-normal"
          lang="ja"
        >
          {kanjiTarget.kanji}
        </span>
        <span className="absolute bottom-2 text-[10px] font-mono text-neutral-400">
          {kanjiTarget.unicode}
        </span>
      </div>

      {/* Contenido interactivo: opciones o escritura */}
      <div className="w-full">
        {inputMode === "choice" ? (
          /* Modo Selección Múltiple */
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
            {options.map((opt, idx) => {
              let optStyles =
                "bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700/80 text-neutral-100";

              if (hasAttempted && answeredRecord) {
                const isUserChoice = answeredRecord.userAnswer === opt;
                const isCorrectOpt =
                  answeredRecord.correctAnswer === opt ||
                  opt === answeredRecord.correctAnswer;

                if (isCorrectOpt) {
                  optStyles =
                    "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50";
                } else if (isUserChoice && !answeredRecord.isCorrect) {
                  optStyles =
                    "bg-rose-950/80 border-rose-500 text-rose-300 line-through opacity-90";
                } else {
                  optStyles = "bg-neutral-900/40 border-neutral-800 text-neutral-600 opacity-50";
                }
              }

              return (
                <button
                  key={`${opt}-${idx}`}
                  type="button"
                  onClick={() => handleChoiceClick(opt)}
                  disabled={hasAttempted}
                  className={`flex items-center justify-center min-h-[48px] px-3 py-2.5 rounded-xl border text-sm sm:text-base font-semibold transition-all duration-150 shadow-sm ${
                    hasAttempted
                      ? "cursor-default"
                      : "cursor-pointer hover:border-amber-400/60 active:scale-95"
                  } ${optStyles}`}
                >
                  <span lang="ja">{opt}</span>
                  {hasAttempted && answeredRecord?.userAnswer === opt && (
                    <span className="ml-1.5 text-xs">
                      {answeredRecord.isCorrect ? "✓" : "✗"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Modo Escritura Directa */
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-3 w-full">
            <div className="relative">
              <input
                type="text"
                value={hasAttempted ? answeredRecord?.userAnswer ?? "" : inputText}
                onChange={handleInputChange}
                placeholder={hasAttempted ? "Respuesta enviada" : "Escribe en romaji (ej. hi, mizu)..."}
                disabled={hasAttempted}
                autoFocus={!hasAttempted}
                className={`w-full px-4 py-3 bg-neutral-950/90 border rounded-xl placeholder-neutral-500 text-center font-medium text-base tracking-wide outline-none transition-all shadow-inner ${
                  hasAttempted
                    ? answeredRecord?.isCorrect
                      ? "border-emerald-500 text-emerald-200 bg-emerald-950/30"
                      : "border-rose-500 text-rose-300 bg-rose-950/30"
                    : "border-neutral-700 focus:border-amber-400 text-neutral-100"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 font-mono">
                {hasAttempted ? "Revisión" : "IME activo"}
              </span>
            </div>

            {!hasAttempted && (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold rounded-xl text-sm transition-all duration-150 active:scale-98 cursor-pointer disabled:cursor-not-allowed shadow-md"
              >
                Confirmar lectura
              </button>
            )}
          </form>
        )}
      </div>

      {/* Retroalimentación didáctica / Panel de Revisión */}
      {hasAttempted && answeredRecord && (
        <div
          role="alert"
          className={`w-full p-4 rounded-2xl border flex flex-col items-center gap-2.5 transition-all animate-fadeIn ${
            answeredRecord.isCorrect
              ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-200"
              : "bg-rose-950/60 border-rose-500/80 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>{answeredRecord.isCorrect ? "✅ ¡Respuesta correcta!" : "❌ Respuesta incorrecta"}</span>
          </div>

          <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-1 sm:gap-4 py-1.5 px-3 bg-neutral-950/60 rounded-xl text-xs">
            <span className="text-neutral-300">
              Tu respuesta: <strong className="font-semibold text-neutral-100">{answeredRecord.userAnswer}</strong>
            </span>
            <span className="text-neutral-300">
              Lectura correcta:{" "}
              <strong className="text-amber-300 font-bold font-serif text-sm ml-1" lang="ja">
                {answeredRecord.correctAnswer}
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={advanceAfterFeedback}
            className="w-full mt-1 py-2.5 px-4 bg-neutral-100 hover:bg-white text-neutral-900 font-extrabold rounded-xl text-xs sm:text-sm tracking-wide transition-all active:scale-98 cursor-pointer shadow-md"
          >
            {isLastQuestion ? "Siguiente pendiente o completar →" : "Siguiente pregunta →"}
          </button>
        </div>
      )}
    </section>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import { useKanjiStore, QUESTIONS_PER_STAGE } from "../../../../store/useKanjiStore";
import {
  getDeterministicVocabWord,
  getVocabOptions,
  normalizeAnswer,
  splitWordFurigana,
} from "../../../../utils/kanji";
import { KanjiLink } from "../KanjiLink";

export const KanjiVocabStage: React.FC = () => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const allKanjis = useKanjiStore((state) => state.allKanjis);
  const date = useKanjiStore((state) => state.date);
  const currentQuestionIndex = useKanjiStore((state) => state.currentQuestionIndex);
  const stageProgress = useKanjiStore((state) => state.stages.vocabulary);
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

  // Selección determinista de la palabra compuesta para el kanji actual
  const targetWord = useMemo(() => {
    if (!kanjiTarget) return null;
    return getDeterministicVocabWord(kanjiTarget, date, currentQuestionIndex);
  }, [kanjiTarget, date, currentQuestionIndex]);

  // Verificar si la pregunta actual ya fue respondida
  const currentAnswer = stageProgress?.answers?.find(
    (a) => a.kanjiId === kanjiTarget?.id
  );
  const hasAttempted = isFeedbackOpen || Boolean(currentAnswer);
  const answeredRecord =
    currentAnswer ||
    (lastFeedback
      ? {
          userAnswer: lastFeedback.userAnswer,
          correctAnswer: lastFeedback.correctAnswer,
          isCorrect: lastFeedback.isCorrect,
        }
      : null);

  // Generación determinista de 4 opciones de significado
  const options = useMemo(() => {
    if (!kanjiTarget || !targetWord || allKanjis.length === 0) return [];
    return getVocabOptions(targetWord, kanjiTarget, allKanjis, date, currentQuestionIndex);
  }, [targetWord, kanjiTarget, allKanjis, date, currentQuestionIndex]);

  // Desglose de cada kanji con su lectura por separado (furigana individual)
  const segments = useMemo(() => {
    if (!targetWord) return [];
    return splitWordFurigana(targetWord.japanese, targetWord.kana, allKanjis);
  }, [targetWord, allKanjis]);

  if (!kanjiTarget || !targetWord) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-400">
        Cargando vocabulario...
      </div>
    );
  }

  const handleChoiceClick = (choice: string) => {
    if (hasAttempted) return;
    submitAnswer(choice);
    // Desenfocar el botón para que los eventos de teclado (Enter) fluyan libremente
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAttempted || !inputText.trim()) return;
    submitAnswer(inputText.trim());
  };

  const isLastQuestion = currentQuestionIndex >= QUESTIONS_PER_STAGE - 1;

  return (
    <section
      aria-label="Etapa 3: Vocabulario Compuesto"
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-4 sm:gap-5 p-4 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-xl backdrop-blur-md"
    >
      {/* Encabezado de la etapa — Directiva de interfaz limpia sin subtítulos */}
      <div className="text-center">
        <h2 className="mt-2 text-base sm:text-lg font-bold text-neutral-100">
          ¿Cuál es el significado de esta palabra?
        </h2>
      </div>

      {/* Tarjeta Visual de la Palabra Compuesta con lectura separada por kanji */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-sm py-5 px-4 rounded-2xl bg-neutral-950/80 border-2 border-neutral-800/90 shadow-inner group">
        <div className="flex items-end justify-center gap-1.5 sm:gap-2.5">
          {segments.map((seg, idx) => (
            <div key={`${seg.char}-${idx}`} className="flex flex-col items-center min-w-[32px]">
              {/* Lectura individual para este kanji */}
              <span className="text-xs sm:text-sm font-medium text-amber-300 select-none min-h-[18px] leading-tight text-center">
                {seg.reading || "\u00A0"}
              </span>
              {/* Carácter: si es kanji, enlace a japonesbasico.com sin alterar estilo */}
              {seg.isKanji ? (
                <KanjiLink
                  kanji={seg.char}
                  className="text-4xl sm:text-5xl font-bold text-neutral-50 select-none tracking-wide"
                >
                  {seg.char}
                </KanjiLink>
              ) : (
                <span
                  className="text-4xl sm:text-5xl font-bold text-neutral-50 select-none tracking-wide"
                  lang="ja"
                >
                  {seg.char}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenido interactivo: opciones o campo de texto */}
      <div className="w-full">
        {inputMode === "choice" ? (
          /* Modo Selección Múltiple */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
            {options.map((opt, idx) => {
              let optStyles =
                "bg-neutral-800/80 hover:bg-neutral-800 border-neutral-700/80 text-neutral-100";

              if (hasAttempted && answeredRecord) {
                const isUserChoice =
                  normalizeAnswer(answeredRecord.userAnswer) ===
                  normalizeAnswer(opt);
                const isCorrectOpt =
                  normalizeAnswer(targetWord.meaning) ===
                  normalizeAnswer(opt);

                if (isCorrectOpt) {
                  optStyles =
                    "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold ring-2 ring-emerald-500/50";
                } else if (isUserChoice && !answeredRecord.isCorrect) {
                  optStyles =
                    "bg-rose-950/80 border-rose-500 text-rose-200 line-through opacity-80";
                } else {
                  optStyles = "bg-neutral-900 border-neutral-800 text-neutral-500 opacity-60";
                }
              }

              return (
                <button
                  key={`${opt}-${idx}`}
                  type="button"
                  disabled={hasAttempted}
                  onClick={() => handleChoiceClick(opt)}
                  className={`flex items-center justify-center p-3 sm:p-3.5 rounded-xl border text-sm sm:text-base font-medium transition-all ${optStyles} ${
                    !hasAttempted
                      ? "active:scale-[0.98] cursor-pointer hover:border-amber-500/50 hover:bg-neutral-800"
                      : "cursor-default"
                  }`}
                >
                  <span className="capitalize">{opt}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Modo Escritura Directa */
          <form onSubmit={handleInputSubmit} className="flex flex-col gap-3 w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                disabled={hasAttempted}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe el significado en español..."
                className="flex-1 px-4 py-3 bg-neutral-950/80 border border-neutral-700/80 rounded-xl text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50"
                autoFocus
              />
              <button
                type="submit"
                disabled={hasAttempted || !inputText.trim()}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-neutral-950 font-bold text-sm rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Enviar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Banner de Feedback / Modo Revisión */}
      {hasAttempted && answeredRecord && (
        <div
          role="status"
          className={`w-full p-4 rounded-2xl border flex flex-col gap-2.5 transition-all ${
            answeredRecord.isCorrect
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/50 text-rose-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-1.5">
              <span>{answeredRecord.isCorrect ? "✅ ¡Correcto!" : "❌ Respuesta Incorrecta"}</span>
            </span>
            <span className="text-[11px] font-mono opacity-80">
              Solución: <strong className="capitalize underline">{targetWord.meaning}</strong>
            </span>
          </div>

          {!answeredRecord.isCorrect && (
            <div className="text-xs text-neutral-300 flex items-center justify-between bg-neutral-900/60 p-2 rounded-lg border border-neutral-800">
              <span>Tu respuesta:</span>
              <span className="font-semibold text-rose-300">{answeredRecord.userAnswer}</span>
            </div>
          )}

          {(isFeedbackOpen || Boolean(answeredRecord)) && (
            <button
              type="button"
              onClick={advanceAfterFeedback}
              className="mt-1 w-full py-2.5 bg-neutral-100 hover:bg-white text-neutral-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.99] cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>{isLastQuestion ? "Completar Etapa" : "Siguiente Ejercicio"}</span>
              <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">(o pulsa Enter)</span>
              <span>➔</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};

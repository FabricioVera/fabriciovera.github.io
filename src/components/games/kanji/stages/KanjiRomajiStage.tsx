import React, { useState, useMemo } from "react";
import { useKanjiStore } from "../../../../store/useKanjiStore";
import { getRomajiOptions } from "../../../../utils/kanji";

export const KanjiRomajiStage: React.FC = () => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const allKanjis = useKanjiStore((state) => state.allKanjis);
  const date = useKanjiStore((state) => state.date);
  const stageProgress = useKanjiStore((state) => state.stages.romaji);
  const inputMode = useKanjiStore((state) => state.inputMode);
  const isFeedbackOpen = useKanjiStore((state) => state.isFeedbackOpen);
  const submitAnswer = useKanjiStore((state) => state.submitAnswer);
  const advanceAfterFeedback = useKanjiStore(
    (state) => state.advanceAfterFeedback
  );

  const [inputText, setInputText] = useState("");
  const hasAttempted =
    stageProgress.attempts > 0 || stageProgress.outcome !== "pending";
  const isIncorrect = stageProgress.outcome === "incorrect";
  const isCorrect = stageProgress.outcome === "correct";

  // Generación determinista de 4 opciones de transcripción Romaji
  const options = useMemo(() => {
    if (!kanjiTarget || allKanjis.length === 0) return [];
    return getRomajiOptions(kanjiTarget, allKanjis, date);
  }, [kanjiTarget, allKanjis, date]);

  if (!kanjiTarget) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-400">
        Cargando kanji del día...
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

  return (
    <section
      aria-label="Etapa 3: Transcripción Romaji del Kanji"
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-5 p-4 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-xl backdrop-blur-md"
    >
      {/* Encabezado de la etapa */}
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Etapa 3 de 4 • Romaji
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

      {/* Contenido interactivo según InputMode */}
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
                  placeholder="Ej. nichi, tsuki, hito..."
                  disabled={hasAttempted}
                  autoComplete="off"
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700 text-neutral-100 placeholder-neutral-400 text-sm sm:text-base font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={hasAttempted || !inputText.trim()}
                  className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-400 text-neutral-950 font-bold text-sm transition-all cursor-pointer shadow-md"
                >
                  Comprobar
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 text-center">
                Escribe en alfabeto latino; se aceptan variantes de pronunciación.
              </p>
            </form>
          )}
        </div>
      )}

      {/* Feedback de Acierto */}
      {isCorrect && (
        <div className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-semibold animate-fadeIn">
          <span>🟩</span>
          <span>¡Correcto! Avanzando al lienzo de trazos...</span>
        </div>
      )}

      {/* Tarjeta Educativa ante Fallo Pedagógico (Regla de 1 intento) */}
      {isIncorrect && isFeedbackOpen && (
        <div
          role="alert"
          className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/60 text-neutral-200 animate-fadeIn"
        >
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <span>🟥</span>
            <span>Intento no acertado</span>
          </div>

          <div className="flex flex-col gap-1 text-xs sm:text-sm">
            <div className="text-neutral-400">
              Tu respuesta:{" "}
              <span className="text-neutral-200 font-medium">
                {stageProgress.userAnswer || "(vacío)"}
              </span>
            </div>
            <div className="text-neutral-300 font-medium">
              Transcripción correcta:{" "}
              <span className="text-amber-300 font-bold text-base lowercase">
                {stageProgress.revealedAnswer}
              </span>
            </div>
            {kanjiTarget.romaji && kanjiTarget.romaji.length > 1 && (
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Otras lecturas romaji: {kanjiTarget.romaji.slice(1).join(", ")}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={advanceAfterFeedback}
            className="w-full mt-1 py-2.5 px-4 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs sm:text-sm transition-transform active:scale-98 cursor-pointer shadow-lg"
          >
            Continuar al lienzo de trazos →
          </button>
        </div>
      )}
    </section>
  );
};

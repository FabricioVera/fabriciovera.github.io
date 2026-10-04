import React, { useEffect, useRef, useState, useCallback } from "react";
import HanziWriter from "hanzi-writer";
import { useKanjiStore } from "../../../../store/useKanjiStore";

export const KanjiStrokeStage: React.FC = () => {
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);
  const stageProgress = useKanjiStore((state) => state.stages.strokes);
  const completeStrokes = useKanjiStore((state) => state.completeStrokes);
  const isCompleted = useKanjiStore((state) => state.isCompleted);

  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalStrokes, setTotalStrokes] = useState<number>(0);
  const [currentStroke, setCurrentStroke] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const isAlreadyFinished = stageProgress.outcome === "correct" || isCompleted;

  const startQuiz = useCallback((writer: HanziWriter) => {
    writer.quiz({
      leniency: 1.1,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onCorrectStroke: (data) => {
        setCurrentStroke(data.strokeNum + 1);
      },
      onMistake: (data) => {
        // Reproduce animación del trazo correcto para guiar pedagógicamente al usuario
        writer.animateStroke(data.strokeNum);
      },
      onComplete: () => {
        completeStrokes();
      },
    });
  }, [completeStrokes]);

  // Inicialización de HanziWriter sobre el lienzo DOM
  useEffect(() => {
    if (!containerRef.current || !kanjiTarget) return;

    // Limpieza de renderizado previo
    containerRef.current.innerHTML = "";
    setIsLoading(true);
    setLoadError(null);

    try {
      const writer = HanziWriter.create(containerRef.current, kanjiTarget.kanji, {
        width: 260,
        height: 260,
        padding: 16,
        showOutline: true,
        showCharacter: isAlreadyFinished,
        strokeAnimationSpeed: 1.2,
        strokeHighlightSpeed: 1.5,
        strokeColor: "#f3f4f6", // blanco tiza
        outlineColor: "#2f3136", // gris tenue silueta
        drawingColor: "#f59e0b", // ámbar para el puntero
        highlightColor: "#38bdf8", // celeste de ayuda
        highlightCompleteColor: "#10b981", // verde esmeralda al completar
        onLoadCharDataSuccess: (data) => {
          setIsLoading(false);
          if (data?.strokes) {
            setTotalStrokes(data.strokes.length);
          }
          if (!isAlreadyFinished) {
            startQuiz(writer);
          }
        },
        onLoadCharDataError: (err) => {
          setIsLoading(false);
          setLoadError("No se pudo cargar los datos de trazo del kanji.");
          console.error("[KanjiStrokeStage] Error cargando HanziWriter:", err);
        },
      });

      writerRef.current = writer;
    } catch (err) {
      setIsLoading(false);
      setLoadError("Error inicializando el lienzo de caligrafía.");
      console.error("[KanjiStrokeStage] Error creando writer:", err);
    }

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
        writerRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [kanjiTarget, isAlreadyFinished, startQuiz]);

  const handleAnimate = () => {
    const writer = writerRef.current;
    if (!writer || isAnimating) return;

    setIsAnimating(true);
    writer.cancelQuiz();
    writer.animateCharacter({
      onComplete: () => {
        setIsAnimating(false);
        if (!isAlreadyFinished) {
          startQuiz(writer);
        }
      },
    });
  };

  const handleReset = () => {
    const writer = writerRef.current;
    if (!writer) return;

    writer.cancelQuiz();
    setCurrentStroke(0);
    startQuiz(writer);
  };

  if (!kanjiTarget) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-400">
        Cargando kanji del día...
      </div>
    );
  }

  return (
    <section
      aria-label="Etapa 4: Caligrafía y Trazos Interactivos"
      className="w-full max-w-lg mx-auto flex flex-col items-center gap-5 p-4 sm:p-6 bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-xl backdrop-blur-md"
    >
      {/* Encabezado */}
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Etapa 4 de 4 • Trazos
        </span>
        <h2 className="mt-2 text-base sm:text-lg font-bold text-neutral-100">
          Dibuja los trazos del Kanji
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Sigue el orden y sentido correcto con tu dedo o ratón.
        </p>
      </div>

      {/* Indicador de Trazo Activo */}
      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/80">
        <span>Trazo:</span>
        <span className="text-amber-400 font-mono font-bold">
          {isAlreadyFinished
            ? `${totalStrokes} de ${totalStrokes}`
            : `${Math.min(currentStroke + 1, totalStrokes || 1)} de ${totalStrokes || "?"}`}
        </span>
      </div>

      {/* Lienzo Interactivo con Cuadrícula de Caligrafía Tradicional (Mizu-Grid) */}
      <div className="relative flex items-center justify-center w-[260px] h-[260px] rounded-2xl bg-neutral-950 border-2 border-neutral-800 shadow-2xl overflow-hidden select-none touch-none">
        {/* Retícula discontinua de 4 cuadrantes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          viewBox="0 0 260 260"
          aria-hidden="true"
        >
          {/* Cruz central */}
          <line
            x1="130"
            y1="0"
            x2="130"
            y2="260"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <line
            x1="0"
            y1="130"
            x2="260"
            y2="130"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          {/* Diagonales sutiles */}
          <line
            x1="0"
            y1="0"
            x2="260"
            y2="260"
            stroke="#fbbf24"
            strokeWidth="0.8"
            strokeDasharray="2,6"
            opacity="0.4"
          />
          <line
            x1="260"
            y1="0"
            x2="0"
            y2="260"
            stroke="#fbbf24"
            strokeWidth="0.8"
            strokeDasharray="2,6"
            opacity="0.4"
          />
        </svg>

        {/* Spinner durante carga de stroke data */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-950/80 z-10 text-xs text-neutral-400">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Cargando trazos...</span>
          </div>
        )}

        {/* Fallback de error */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-neutral-950/90 z-10 text-xs text-rose-400">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 px-3 py-1 bg-neutral-800 rounded text-neutral-200"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Contenedor donde HanziWriter monta el SVG */}
        <div
          ref={containerRef}
          className="w-[260px] h-[260px] cursor-crosshair"
          aria-label={`Lienzo de dibujo para el kanji ${kanjiTarget.kanji}`}
        />
      </div>

      {/* Botones de Control y Utilidades */}
      <div className="flex items-center gap-3 w-full justify-center">
        <button
          type="button"
          onClick={handleAnimate}
          disabled={isLoading || isAnimating}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
          title="Ver animación del orden de trazos"
        >
          <span>🎬</span>
          <span>{isAnimating ? "Animando..." : "Ver animación"}</span>
        </button>

        {!isAlreadyFinished && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading || isAnimating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-300 text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            title="Reiniciar lienzo para volver a trazar"
          >
            <span>🔄</span>
            <span>Reiniciar</span>
          </button>
        )}
      </div>

      {/* Banner de Felicitación al Finalizar */}
      {isAlreadyFinished && (
        <div
          role="status"
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-bold shadow-lg animate-fadeIn"
        >
          <span>🟩</span>
          <span>¡Caligrafía completada con éxito!</span>
        </div>
      )}
    </section>
  );
};

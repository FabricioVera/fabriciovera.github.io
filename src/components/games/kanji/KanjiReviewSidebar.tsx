import React, { useEffect } from "react";
import { useKanjiStore } from "../../../store/useKanjiStore";
import { KanjiLink } from "./KanjiLink";

export interface KanjiReviewSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar lateral no intrusivo para repaso de kanjis con errores registrados.
 * Permite visualizar el kanji con enlace a japonesbasico.com, significado en español,
 * lectura en romaji y botón individual para eliminar del listado.
 */
export const KanjiReviewSidebar: React.FC<KanjiReviewSidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const reviewList = useKanjiStore((state) => state.reviewList);
  const removeKanjiFromReview = useKanjiStore((state) => state.removeKanjiFromReview);
  const clearReviewList = useKanjiStore((state) => state.clearReviewList);

  // Cierre opcional con tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay oscuro para pantallas móviles (< sm) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 sm:hidden transition-opacity animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Lateral Derecho: No intrusivo para consultar o repasar mientras se juega */}
      <aside
        role="complementary"
        aria-label="Kanjis pendientes de repaso"
        className={`fixed top-0 right-0 h-screen w-84 sm:w-96 max-w-[92vw] bg-neutral-900/95 border-l border-neutral-800 z-40 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out backdrop-blur-md ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Cabecera del Sidebar — Directiva de interfaz limpia sin subtítulos */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/80 bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-lg">📝</span>
            <h2 className="text-sm font-bold text-neutral-100 tracking-wide flex items-center gap-2">
              <span>Kanjis a Repasar</span>
              {reviewList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {reviewList.length}
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Cerrar panel de repaso"
            title="Cerrar panel"
          >
            ✕
          </button>
        </div>

        {/* Barra de Acciones si hay kanjis guardados */}
        {reviewList.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-950/60 border-b border-neutral-800/60 text-xs">
            <span className="text-neutral-400 font-medium">
              {reviewList.length === 1 ? "1 kanji registrado" : `${reviewList.length} kanjis registrados`}
            </span>
            <button
              type="button"
              onClick={clearReviewList}
              className="text-[11px] font-semibold text-neutral-400 hover:text-rose-300 hover:underline transition-colors cursor-pointer"
              title="Vaciar todos los kanjis del repaso"
            >
              Vaciar lista
            </button>
          </div>
        )}

        {/* Lista Desplazable de Kanjis para Repaso */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
          {reviewList.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-neutral-400 gap-2">
              <span className="text-3xl">✨</span>
              <p className="text-xs sm:text-sm font-medium text-neutral-300">
                No tienes kanjis pendientes de repaso.
              </p>
              <p className="text-[11px] text-neutral-500">
                Los kanjis en los que cometas errores se guardarán aquí automáticamente.
              </p>
            </div>
          ) : (
            reviewList.map((item) => (
              <div
                key={item.id || item.kanji}
                className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950/60 hover:bg-neutral-950 border border-neutral-800 hover:border-neutral-700/80 transition-all shadow-sm group"
              >
                {/* Kanji vinculado a japonesbasico.com con estilo intacto */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-amber-500/40 transition-colors">
                    <KanjiLink
                      kanji={item.kanji}
                      className="text-3xl font-serif font-black text-amber-400 select-none"
                    >
                      {item.kanji}
                    </KanjiLink>
                  </div>

                  {/* Información: Significado y Escritura en Romaji */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-neutral-100 capitalize truncate" title={item.meaning}>
                      {item.meaning || "Sin significado"}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mt-0.5 truncate">
                      <span className="text-neutral-500">Romaji:</span>
                      <span className="text-neutral-300 font-medium">
                        {item.romaji || "—"}
                      </span>
                    </div>
                    {item.readingKana && (
                      <span className="text-[10px] font-serif text-amber-300/80 mt-0.5" lang="ja">
                        {item.readingKana}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pequeña X para eliminar el kanji de la lista de repaso */}
                <button
                  type="button"
                  onClick={() => removeKanjiFromReview(item.kanji)}
                  className="shrink-0 p-1.5 ml-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800/80 transition-all cursor-pointer"
                  title={`Eliminar ${item.kanji} del repaso`}
                  aria-label={`Eliminar ${item.kanji} del repaso`}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

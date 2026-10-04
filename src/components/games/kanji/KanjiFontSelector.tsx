import React, { useState, useRef, useEffect } from "react";
import { useKanjiStore } from "../../../store/useKanjiStore";
import type { KanjiFontFamily, KanjiFontOption } from "../../../types/kanji";

export const FONT_OPTIONS: KanjiFontOption[] = [
  {
    id: "noto-sans-jp",
    name: "Noto Sans JP",
    category: "Gothic Estándar",
    className: "font-noto-sans-jp",
    cssFamily: "'Noto Sans JP', sans-serif",
  },
  {
    id: "zen-kaku-gothic",
    name: "Zen Kaku Gothic",
    category: "Moderna / Espaciada",
    className: "font-zen-kaku",
    cssFamily: "'Zen Kaku Gothic New', sans-serif",
  },
  {
    id: "biz-ud-gothic",
    name: "BIZ UDPGothic",
    category: "Diseño Universal (UD)",
    className: "font-biz-ud",
    cssFamily: "'BIZ UDPGothic', sans-serif",
  },
  {
    id: "klee-one",
    name: "Klee One",
    category: "Caligrafía a Lápiz",
    className: "font-klee-one",
    cssFamily: "'Klee One', cursive",
  },
  {
    id: "zen-maru-gothic",
    name: "Zen Maru Gothic",
    category: "Redondeada",
    className: "font-zen-maru",
    cssFamily: "'Zen Maru Gothic', sans-serif",
  },
];

export interface KanjiFontSelectorProps {
  className?: string;
}

export const KanjiFontSelector: React.FC<KanjiFontSelectorProps> = ({ className = "" }) => {
  const selectedFont = useKanjiStore((state) => state.selectedFont);
  const setSelectedFont = useKanjiStore((state) => state.setSelectedFont);
  const kanjiTarget = useKanjiStore((state) => state.kanjiTarget);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    FONT_OPTIONS.find((f) => f.id === selectedFont) || FONT_OPTIONS[0];

  // Cerrar al hacer clic fuera del dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const sampleChar = kanjiTarget?.kanji || "語";

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-medium text-neutral-300 transition-all cursor-pointer shadow-sm active:scale-95"
        title="Cambiar tipografía japonesa para probar legibilidad"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-amber-400 font-bold">🔤</span>
        <span className="hidden xs:inline text-neutral-400">Fuente:</span>
        <span className="font-semibold text-neutral-200">{activeOption.name}</span>
        <span className="text-[10px] text-neutral-500">▼</span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Opciones de tipografías japonesas"
          className="absolute right-0 mt-2 w-64 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-50 backdrop-blur-xl animate-fadeIn"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-bold text-neutral-400 border-b border-neutral-800/80 mb-1">
            Tipografías Japonesas
          </div>

          <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
            {FONT_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedFont;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedFont(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-200"
                      : "hover:bg-neutral-800/70 text-neutral-300 border border-transparent"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{opt.name}</span>
                    <span className="text-[10px] text-neutral-400">{opt.category}</span>
                  </div>
                  <span
                    className={`text-xl font-bold ml-2 ${opt.className}`}
                    lang="ja"
                    title={`Muestra en ${opt.name}`}
                  >
                    {sampleChar}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

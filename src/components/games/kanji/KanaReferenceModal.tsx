import React, { useState, useEffect, useMemo } from "react";
import kanaData from "../../../data/kanji/kana.json";
import type { KanaItem } from "../../../types/kanji";

export interface KanaReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type KanaCategory = "basic" | "dakuon" | "yoon";

export const KanaReferenceModal: React.FC<KanaReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana");
  const [activeSection, setActiveSection] = useState<KanaCategory>("basic");

  // Manejo de tecla Escape para cerrar
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

  // Filtrado de kanas según el silabario activo
  const filteredKanas = useMemo(() => {
    const list = (kanaData as KanaItem[]).filter(
      (item) => item.type === activeTab
    );

    // Separación por categorías fonéticas
    // Básico: 46 caracteres iniciales (hasta 'ん' o 'ン')
    // Dakuon: modificados con comillas o círculo (ga..po)
    // Yoon: dígrafos con ya, yu, yo pequeños (kya, etc.)
    const basicList = list.filter(
      (item) =>
        item.romaji.length <= 3 &&
        !item.romaji.startsWith("g") &&
        !item.romaji.startsWith("z") &&
        !item.romaji.startsWith("d") &&
        !item.romaji.startsWith("b") &&
        !item.romaji.startsWith("p") &&
        !item.romaji.includes("y")
    );

    const dakuonList = list.filter(
      (item) =>
        (item.romaji.startsWith("g") ||
          item.romaji.startsWith("z") ||
          item.romaji.startsWith("d") ||
          item.romaji.startsWith("b") ||
          item.romaji.startsWith("p")) &&
        !item.romaji.includes("y")
    );

    const yoonList = list.filter((item) => item.romaji.includes("y") || item.romaji.startsWith("sh") || item.romaji.startsWith("ch") || item.romaji.startsWith("j"));

    return {
      all: list,
      basic: basicList,
      dakuon: dakuonList,
      yoon: yoonList.length > 0 ? list.slice(71) : [],
    };
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Silabario Kana de referencia"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Cabecera del modal — Directiva de interfaz limpia sin subtítulos */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">あ/ア</span>
            <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-wide">
              Silabario Kana
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Selector de Pestañas: Hiragana vs. Katakana */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-neutral-950/60 border-b border-neutral-800/60 gap-3">
          <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveTab("hiragana")}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "hiragana"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Hiragana (ひらがな)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("katakana")}
              className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "katakana"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Katakana (カタカナ)
            </button>
          </div>

          <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
            {filteredKanas.all.length} caracteres
          </span>
        </div>

        {/* Contenido desplazable con matriz de caracteres */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Sección 1: Básicos (Gojūon) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Básicos (Gojūon)
              </h3>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {filteredKanas.all.slice(0, 46).map((item, idx) => (
                <div
                  key={`${item.kana}-${idx}`}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/40 hover:border-amber-500/40 transition-all group"
                >
                  <span className="text-lg sm:text-xl font-bold text-neutral-100 group-hover:text-amber-300 transition-colors">
                    {item.kana}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 group-hover:text-neutral-300">
                    {item.romaji}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sección 2: Dakuon & Handakuon (Sonidos impuros / semimpuros) */}
          {filteredKanas.all.length > 46 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Dakuon y Handakuon
                </h3>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {filteredKanas.all.slice(46, 71).map((item, idx) => (
                  <div
                    key={`${item.kana}-${idx}`}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/40 hover:border-indigo-500/40 transition-all group"
                  >
                    <span className="text-lg sm:text-xl font-bold text-neutral-100 group-hover:text-indigo-300 transition-colors">
                      {item.kana}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400 group-hover:text-neutral-300">
                      {item.romaji}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección 3: Dígrafos / Yōon (Combinaciones) */}
          {filteredKanas.all.length > 71 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Dígrafos (Yōon)
                </h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {filteredKanas.all.slice(71).map((item, idx) => (
                  <div
                    key={`${item.kana}-${idx}`}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/40 hover:border-emerald-500/40 transition-all group"
                  >
                    <span className="text-base sm:text-lg font-bold text-neutral-100 group-hover:text-emerald-300 transition-colors">
                      {item.kana}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400 group-hover:text-neutral-300">
                      {item.romaji}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

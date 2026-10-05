import React, { useState, useEffect } from "react";

export interface KanaReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KanaCell {
  k: string;
  r: string;
}

type KanaRow = (KanaCell | null)[];

// --- Tablas canónicas organizadas estrictamente en 5 columnas (a, i, u, e, o) ---
const HIRAGANA_GOJUON: KanaRow[] = [
  // a, i, u, e, o
  [{ k: "あ", r: "a" }, { k: "い", r: "i" }, { k: "う", r: "u" }, { k: "え", r: "e" }, { k: "お", r: "o" }],
  [{ k: "か", r: "ka" }, { k: "き", r: "ki" }, { k: "く", r: "ku" }, { k: "け", r: "ke" }, { k: "こ", r: "ko" }],
  [{ k: "さ", r: "sa" }, { k: "し", r: "shi" }, { k: "す", r: "su" }, { k: "せ", r: "se" }, { k: "そ", r: "so" }],
  [{ k: "た", r: "ta" }, { k: "ち", r: "chi" }, { k: "つ", r: "tsu" }, { k: "て", r: "te" }, { k: "と", r: "to" }],
  [{ k: "な", r: "na" }, { k: "に", r: "ni" }, { k: "ぬ", r: "nu" }, { k: "ね", r: "ne" }, { k: "の", r: "no" }],
  [{ k: "は", r: "ha" }, { k: "ひ", r: "hi" }, { k: "ふ", r: "fu" }, { k: "へ", r: "he" }, { k: "ほ", r: "ho" }],
  [{ k: "ま", r: "ma" }, { k: "み", r: "mi" }, { k: "む", r: "mu" }, { k: "め", r: "me" }, { k: "も", r: "mo" }],
  [{ k: "や", r: "ya" }, null, { k: "ゆ", r: "yu" }, null, { k: "よ", r: "yo" }],
  [{ k: "ら", r: "ra" }, { k: "り", r: "ri" }, { k: "る", r: "ru" }, { k: "れ", r: "re" }, { k: "ろ", r: "ro" }],
  [{ k: "わ", r: "wa" }, null, null, null, { k: "を", r: "wo" }],
  [{ k: "ん", r: "n" }, null, null, null, null],
];

const KATAKANA_GOJUON: KanaRow[] = [
  [{ k: "ア", r: "a" }, { k: "イ", r: "i" }, { k: "ウ", r: "u" }, { k: "エ", r: "e" }, { k: "オ", r: "o" }],
  [{ k: "カ", r: "ka" }, { k: "キ", r: "ki" }, { k: "ク", r: "ku" }, { k: "ケ", r: "ke" }, { k: "コ", r: "ko" }],
  [{ k: "サ", r: "sa" }, { k: "シ", r: "shi" }, { k: "ス", r: "su" }, { k: "セ", r: "se" }, { k: "ソ", r: "so" }],
  [{ k: "タ", r: "ta" }, { k: "チ", r: "chi" }, { k: "ツ", r: "tsu" }, { k: "テ", r: "te" }, { k: "ト", r: "to" }],
  [{ k: "ナ", r: "na" }, { k: "ニ", r: "ni" }, { k: "ヌ", r: "nu" }, { k: "ネ", r: "ne" }, { k: "ノ", r: "no" }],
  [{ k: "ハ", r: "ha" }, { k: "ヒ", r: "hi" }, { k: "フ", r: "fu" }, { k: "ヘ", r: "he" }, { k: "ホ", r: "ho" }],
  [{ k: "マ", r: "ma" }, { k: "ミ", r: "mi" }, { k: "ム", r: "mu" }, { k: "メ", r: "me" }, { k: "モ", r: "mo" }],
  [{ k: "ヤ", r: "ya" }, null, { k: "ユ", r: "yu" }, null, { k: "ヨ", r: "yo" }],
  [{ k: "ラ", r: "ra" }, { k: "リ", r: "ri" }, { k: "ル", r: "ru" }, { k: "レ", r: "re" }, { k: "ロ", r: "ro" }],
  [{ k: "ワ", r: "wa" }, null, null, null, { k: "ヲ", r: "wo" }],
  [{ k: "ン", r: "n" }, null, null, null, null],
];

const HIRAGANA_DAKUON: KanaRow[] = [
  [{ k: "が", r: "ga" }, { k: "ぎ", r: "gi" }, { k: "ぐ", r: "gu" }, { k: "げ", r: "ge" }, { k: "ご", r: "go" }],
  [{ k: "ざ", r: "za" }, { k: "じ", r: "ji" }, { k: "ず", r: "zu" }, { k: "ぜ", r: "ze" }, { k: "ぞ", r: "zo" }],
  [{ k: "だ", r: "da" }, { k: "ぢ", r: "ji" }, { k: "づ", r: "zu" }, { k: "で", r: "de" }, { k: "ど", r: "do" }],
  [{ k: "ば", r: "ba" }, { k: "び", r: "bi" }, { k: "ぶ", r: "bu" }, { k: "べ", r: "be" }, { k: "ぼ", r: "bo" }],
  [{ k: "ぱ", r: "pa" }, { k: "ぴ", r: "pi" }, { k: "ぷ", r: "pu" }, { k: "ぺ", r: "pe" }, { k: "ぽ", r: "po" }],
];

const KATAKANA_DAKUON: KanaRow[] = [
  [{ k: "ガ", r: "ga" }, { k: "ギ", r: "gi" }, { k: "グ", r: "gu" }, { k: "ゲ", r: "ge" }, { k: "ゴ", r: "go" }],
  [{ k: "ザ", r: "za" }, { k: "ジ", r: "ji" }, { k: "ズ", r: "zu" }, { k: "ゼ", r: "ze" }, { k: "ゾ", r: "zo" }],
  [{ k: "ダ", r: "da" }, { k: "ヂ", r: "ji" }, { k: "ヅ", r: "zu" }, { k: "デ", r: "de" }, { k: "ド", r: "do" }],
  [{ k: "バ", r: "ba" }, { k: "ビ", r: "bi" }, { k: "ブ", r: "bu" }, { k: "ベ", r: "be" }, { k: "ボ", r: "bo" }],
  [{ k: "パ", r: "pa" }, { k: "ピ", r: "pi" }, { k: "プ", r: "pu" }, { k: "ペ", r: "pe" }, { k: "ポ", r: "po" }],
];

// Yōon (Dígrafos - columnas ya, yu, yo)
const HIRAGANA_YOON: KanaRow[] = [
  [{ k: "きゃ", r: "kya" }, { k: "きゅ", r: "kyu" }, { k: "きょ", r: "kyo" }],
  [{ k: "しゃ", r: "sha" }, { k: "しゅ", r: "shu" }, { k: "しょ", r: "sho" }],
  [{ k: "ちゃ", r: "cha" }, { k: "ちゅ", r: "chu" }, { k: "ちょ", r: "cho" }],
  [{ k: "にゃ", r: "nya" }, { k: "にゅ", r: "nyu" }, { k: "にょ", r: "nyo" }],
  [{ k: "ひゃ", r: "hya" }, { k: "ひゅ", r: "hyu" }, { k: "ひょ", r: "hyo" }],
  [{ k: "みゃ", r: "mya" }, { k: "みゅ", r: "myu" }, { k: "みょ", r: "myo" }],
  [{ k: "りゃ", r: "rya" }, { k: "りゅ", r: "ryu" }, { k: "りょ", r: "ryo" }],
  [{ k: "ぎゃ", r: "gya" }, { k: "ぎゅ", r: "gyu" }, { k: "ぎょ", r: "gyo" }],
  [{ k: "じゃ", r: "ja" }, { k: "じゅ", r: "ju" }, { k: "じょ", r: "jo" }],
  [{ k: "びゃ", r: "bya" }, { k: "びゅ", r: "byu" }, { k: "びょ", r: "byo" }],
  [{ k: "ぴゃ", r: "pya" }, { k: "ぴゅ", r: "pyu" }, { k: "ぴょ", r: "pyo" }],
];

const KATAKANA_YOON: KanaRow[] = [
  [{ k: "キャ", r: "kya" }, { k: "キュ", r: "kyu" }, { k: "キョ", r: "kyo" }],
  [{ k: "シャ", r: "sha" }, { k: "シュ", r: "shu" }, { k: "ショ", r: "sho" }],
  [{ k: "チャ", r: "cha" }, { k: "チュ", r: "chu" }, { k: "チョ", r: "cho" }],
  [{ k: "ニャ", r: "nya" }, { k: "ニュ", r: "nyu" }, { k: "ニョ", r: "nyo" }],
  [{ k: "ヒャ", r: "hya" }, { k: "ヒュ", r: "hyu" }, { k: "ヒョ", r: "hyo" }],
  [{ k: "ミャ", r: "mya" }, { k: "ミュ", r: "myu" }, { k: "ミョ", r: "myo" }],
  [{ k: "リャ", r: "rya" }, { k: "リュ", r: "ryu" }, { k: "リョ", r: "ryo" }],
  [{ k: "ギャ", r: "gya" }, { k: "ギュ", r: "gyu" }, { k: "ギョ", r: "gyo" }],
  [{ k: "ジャ", r: "ja" }, { k: "ジュ", r: "ju" }, { k: "ジョ", r: "jo" }],
  [{ k: "ビャ", r: "bya" }, { k: "ビュ", r: "byu" }, { k: "ビョ", r: "byo" }],
  [{ k: "ピャ", r: "pya" }, { k: "ピュ", r: "pyu" }, { k: "ピョ", r: "pyo" }],
];

export const KanaReferenceModal: React.FC<KanaReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana");
  const [activeCategory, setActiveCategory] = useState<"gojuon" | "dakuon" | "yoon">("gojuon");

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

  const isHiragana = activeTab === "hiragana";
  const gojuonRows = isHiragana ? HIRAGANA_GOJUON : KATAKANA_GOJUON;
  const dakuonRows = isHiragana ? HIRAGANA_DAKUON : KATAKANA_DAKUON;
  const yoonRows = isHiragana ? HIRAGANA_YOON : KATAKANA_YOON;

  return (
    <>
      {/* Overlay oscuro solo en móviles pequeños (< sm) para cerrar fácilmente sin bloquear desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 sm:hidden transition-opacity animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Lateral Derecho: No intrusivo para poder jugar y consultar a la vez */}
      <aside
        role="complementary"
        aria-label="Silabario Kana de referencia"
        className={`fixed top-0 right-0 h-screen w-84 sm:w-96 max-w-[92vw] bg-neutral-900/95 border-l border-neutral-800 z-40 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out backdrop-blur-md ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800/80 bg-neutral-900/90">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-lg">あ/ア</span>
            <h2 className="text-sm font-bold text-neutral-100 tracking-wide">
              Silabario Kana
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Cerrar silabario"
            title="Cerrar silabario"
          >
            ✕
          </button>
        </div>

        {/* Selector de Silabario: Hiragana vs. Katakana */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-950/60 border-b border-neutral-800/60 gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 w-full">
            <button
              type="button"
              onClick={() => setActiveTab("hiragana")}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer text-center ${
                activeTab === "hiragana"
                  ? "bg-amber-500 text-neutral-950 shadow-sm font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Hiragana (あ)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("katakana")}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer text-center ${
                activeTab === "katakana"
                  ? "bg-amber-500 text-neutral-950 shadow-sm font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Katakana (ア)
            </button>
          </div>
        </div>

        {/* Sub-categorías: Gojūon / Dakuon / Yōon */}
        <div className="flex items-center justify-around px-3 py-1.5 bg-neutral-950/40 border-b border-neutral-800/40 text-[11px] font-medium text-neutral-400">
          <button
            type="button"
            onClick={() => setActiveCategory("gojuon")}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              activeCategory === "gojuon"
                ? "bg-amber-500/20 text-amber-300 font-bold"
                : "hover:text-neutral-200"
            }`}
          >
            Básicos (a-i-u-e-o)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("dakuon")}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              activeCategory === "dakuon"
                ? "bg-amber-500/20 text-amber-300 font-bold"
                : "hover:text-neutral-200"
            }`}
          >
            Dakuon (濁音)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("yoon")}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              activeCategory === "yoon"
                ? "bg-amber-500/20 text-amber-300 font-bold"
                : "hover:text-neutral-200"
            }`}
          >
            Dígrafos (拗音)
          </button>
        </div>

        {/* Contenido desplazable con cuadrícula */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
          {activeCategory === "gojuon" && (
            <div>
              {/* Encabezado estricto de las 5 columnas: a, i, u, e, o */}
              <div className="grid grid-cols-5 gap-1.5 mb-2 text-center text-xs font-mono font-bold text-amber-400 bg-neutral-950/60 py-1 rounded-lg border border-neutral-800/60">
                <span>a</span>
                <span>i</span>
                <span>u</span>
                <span>e</span>
                <span>o</span>
              </div>

              {/* Filas de caracteres */}
              <div className="flex flex-col gap-1.5">
                {gojuonRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-5 gap-1.5">
                    {row.map((cell, cIdx) => {
                      if (!cell) {
                        return (
                          <div
                            key={`empty-${rIdx}-${cIdx}`}
                            className="h-11 flex items-center justify-center rounded-xl bg-neutral-950/30 border border-neutral-800/30 text-neutral-600 text-xs select-none"
                          >
                            ·
                          </div>
                        );
                      }
                      return (
                        <div
                          key={`${cell.k}-${cIdx}`}
                          className="h-11 flex flex-col items-center justify-center rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 hover:border-amber-500/50 transition-all select-none group"
                        >
                          <span className="text-base font-bold text-neutral-100 leading-none group-hover:text-amber-300">
                            {cell.k}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 mt-0.5">
                            {cell.r}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "dakuon" && (
            <div>
              {/* Encabezado estricto de las 5 columnas: a, i, u, e, o */}
              <div className="grid grid-cols-5 gap-1.5 mb-2 text-center text-xs font-mono font-bold text-indigo-400 bg-neutral-950/60 py-1 rounded-lg border border-neutral-800/60">
                <span>a</span>
                <span>i</span>
                <span>u</span>
                <span>e</span>
                <span>o</span>
              </div>

              {/* Filas Dakuon y Handakuon */}
              <div className="flex flex-col gap-1.5">
                {dakuonRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-5 gap-1.5">
                    {row.map((cell, cIdx) => (
                      <div
                        key={`${cell?.k}-${cIdx}`}
                        className="h-11 flex flex-col items-center justify-center rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 hover:border-indigo-500/50 transition-all select-none group"
                      >
                        <span className="text-base font-bold text-neutral-100 leading-none group-hover:text-indigo-300">
                          {cell?.k}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 mt-0.5">
                          {cell?.r}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCategory === "yoon" && (
            <div>
              {/* Encabezado de 3 columnas para dígrafos: ya, yu, yo */}
              <div className="grid grid-cols-3 gap-1.5 mb-2 text-center text-xs font-mono font-bold text-emerald-400 bg-neutral-950/60 py-1 rounded-lg border border-neutral-800/60">
                <span>-ya</span>
                <span>-yu</span>
                <span>-yo</span>
              </div>

              {/* Filas Yōon */}
              <div className="flex flex-col gap-1.5">
                {yoonRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-3 gap-1.5">
                    {row.map((cell, cIdx) => (
                      <div
                        key={`${cell?.k}-${cIdx}`}
                        className="h-11 flex flex-col items-center justify-center rounded-xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700/50 hover:border-emerald-500/50 transition-all select-none group"
                      >
                        <span className="text-sm font-bold text-neutral-100 leading-none group-hover:text-emerald-300">
                          {cell?.k}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 mt-0.5">
                          {cell?.r}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

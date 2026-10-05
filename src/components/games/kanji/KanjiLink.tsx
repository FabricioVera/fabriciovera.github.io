import React from "react";

export interface KanjiLinkProps {
  kanji: string;
  className?: string;
  children?: React.ReactNode;
  lang?: string;
}

/**
 * Componente enlace para kanjis individuales hacia japonesbasico.com.
 * Mantiene intacto el estilo tipográfico, color y apariencia visual sin formato tradicional de enlace.
 */
export const KanjiLink: React.FC<KanjiLinkProps> = ({
  kanji,
  className = "",
  children,
  lang = "ja",
}) => {
  if (!kanji) return <>{children || null}</>;

  return (
    <a
      href={`https://japonesbasico.com/kanji/${encodeURIComponent(kanji)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`no-underline hover:opacity-85 transition-opacity cursor-pointer ${className}`}
      style={{ textDecoration: "none", color: "inherit" }}
      title={`Ver ficha del kanji "${kanji}" en japonesbasico.com`}
      onClick={(e) => e.stopPropagation()}
      lang={lang}
    >
      {children || kanji}
    </a>
  );
};

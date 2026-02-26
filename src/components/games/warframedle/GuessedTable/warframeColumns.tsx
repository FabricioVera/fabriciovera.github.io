import type { ColumnDef } from "src/types/table";
import type { Warframe } from "src/types/warframe";
import { hasIntersection, haveSameElements } from "@utils/array";
import { getWikiThumbnail, getWarframeImageName } from "@utils/index";

const MATCH = "bg-success text-center";
const NOT_MATCH = "bg-error text-center";
const PARTIAL_MATCH = "bg-warning text-center";

// Definimos la configuración de las columnas específicas para este juego
export const warframedleColumns: ColumnDef<Warframe>[] = [
  {
    header: "Imagen",
    getCellClass: (guess, target) =>
      guess.name === target.name ? MATCH : NOT_MATCH,
    renderCell: (guess) => (
      <div className="flex justify-center items-center">
        <img
          src={getWikiThumbnail(getWarframeImageName(guess.name))}
          alt={guess.name}
          className="w-24 h-24 rounded-full"
        />
      </div>
    ),
  },
  {
    header: "Warframe",
    getCellClass: (guess, target) =>
      guess.name === target.name ? MATCH : NOT_MATCH,
    renderCell: (guess) => guess.name,
  },
  {
    header: "Género",
    getCellClass: (guess, target) =>
      guess.sex === target.sex ? MATCH : NOT_MATCH,
    renderCell: (guess) => guess.sex,
  },
  {
    header: "Es Prime?",
    getCellClass: (guess, target) =>
      guess.isPrime === target.isPrime ? MATCH : NOT_MATCH,
    renderCell: (guess) => (guess.isPrime ? "Prime" : "No Prime"),
  },
  {
    header: "Aura",
    getCellClass: (guess, target) =>
      guess.aura === target.aura ? MATCH : NOT_MATCH,
    renderCell: (guess) => guess.aura,
  },
  {
    header: "Playstyle",
    getCellClass: (guess, target) => {
      if (!Array.isArray(guess.playstyle)) return NOT_MATCH;
      if (haveSameElements(guess.playstyle, target.playstyle)) return MATCH;
      if (hasIntersection(guess.playstyle, target.playstyle))
        return PARTIAL_MATCH;
      return NOT_MATCH;
    },
    renderCell: (guess) => {
      if (!Array.isArray(guess.playstyle)) return "Error de config";
      return guess.playstyle.join(", ");
    },
  },
  {
    header: "Año de Salida",
    getCellClass: (guess, target) =>
      guess.releaseYear === target.releaseYear ? MATCH : NOT_MATCH,
    renderCell: (guess, target) => {
      if (target.releaseYear > guess.releaseYear)
        return `${guess.releaseYear} ⬆️`;
      if (target.releaseYear < guess.releaseYear)
        return `${guess.releaseYear} ⬇️`;
      return guess.releaseYear;
    },
  },
];

export const abilitydleColumns: ColumnDef<Warframe>[] = [
  {
    header: "Imagen",
    getCellClass: (guess, target) =>
      guess.name === target.name ? MATCH : NOT_MATCH,
    renderCell: (guess) => (
      <div className="flex justify-center items-center">
        <img
          src={getWikiThumbnail(getWarframeImageName(guess.name))}
          alt={guess.name}
          className="w-24 h-24 rounded-full"
        />
      </div>
    ),
  },
  {
    header: "Warframe",
    getCellClass: (guess, target) =>
      guess.name === target.name ? MATCH : NOT_MATCH,
    renderCell: (guess) => guess.name,
  },
];

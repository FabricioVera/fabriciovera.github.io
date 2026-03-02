import type { ColumnDef } from "src/types/table";
import type { Warframe } from "src/types/warframe";
import { getWikiThumbnail, getWarframeImageName } from "@utils/index";
import { createArrayMatchClass, createExactMatchClass } from "@config/columns";
import type { OperatorDTO } from "../types";

export const warframedleColumns: ColumnDef<Warframe>[] = [
  {
    header: "Warframe",
    getCellClass: createExactMatchClass<Warframe>("name"),
    renderCell: (guess) => (
      <div className="flex flex-row gap-4 justify-start items-center">
        <img
          src={getWikiThumbnail(getWarframeImageName(guess.name))}
          alt={guess.name}
          className="w-24 h-24 rounded-full"
        />
        <div className="m-auto">{guess.name}</div>
      </div>
    ),
  },
  {
    header: "Género",
    getCellClass: createExactMatchClass<Warframe>("sex"),
    renderCell: (guess) => guess.sex,
  },
  {
    header: "Es Prime?",
    getCellClass: createExactMatchClass<Warframe>("isPrime"),
    renderCell: (guess) => (guess.isPrime ? "Prime" : "No Prime"),
  },
  {
    header: "Aura",
    getCellClass: createExactMatchClass<Warframe>("aura"),
    renderCell: (guess) => guess.aura,
  },
  {
    header: "Playstyle",
    getCellClass: createArrayMatchClass<Warframe>("playstyle"),
    renderCell: (guess) => {
      if (!Array.isArray(guess.playstyle)) return "Error de config";
      return guess.playstyle.join(", ");
    },
  },
  {
    header: "Año de Salida",
    getCellClass: createExactMatchClass<Warframe>("releaseYear"),
    renderCell: (guess, target) => {
      if (target && target.releaseYear > guess.releaseYear)
        return `${guess.releaseYear} ⬆️`;
      if (target && target.releaseYear < guess.releaseYear)
        return `${guess.releaseYear} ⬇️`;
      return guess.releaseYear;
    },
  },
];

export const abilitydleColumns: ColumnDef<Warframe>[] = [
  {
    header: "Warframe",
    getCellClass: createExactMatchClass<Warframe>("name"),
    renderCell: (guess) => (
      <div className="flex flex-row gap-4 justify-start items-center">
        <img
          src={getWikiThumbnail(getWarframeImageName(guess.name))}
          alt={guess.name}
          className="w-24 h-24 rounded-full"
        />
        <div className="m-auto">{guess.name}</div>
      </div>
    ),
  },
];

export const ArknightdleColumns: ColumnDef<OperatorDTO>[] = [
  {
    header: "Operator",
    getCellClass: createExactMatchClass<OperatorDTO>("name"),
    renderCell: (guess) => (
      <div className="flex flex-row gap-4 justify-start items-center">
        <img
          src={guess.imageURL}
          className="w-24 h-24 rounded-full object-cover"
        ></img>
        <div className="m-auto">{guess.name}</div>
      </div>
    ),
  },
  {
    header: "Género",
    getCellClass: createExactMatchClass<OperatorDTO>("sex"),
    renderCell: (guess) => guess.sex,
  },
  {
    header: "Afiliación",
    getCellClass: createExactMatchClass<OperatorDTO>("affiliation"),
    renderCell: (guess) => guess.affiliation,
  },
  {
    header: "Raza",
    getCellClass: createExactMatchClass<OperatorDTO>("race"),
    renderCell: (guess) => guess.race,
  },
  {
    header: "Clase",
    getCellClass: createExactMatchClass<OperatorDTO>("class"),
    renderCell: (guess) => guess.class,
  },
  {
    header: "Rareza",
    getCellClass: createExactMatchClass<OperatorDTO>("rarity"),
    renderCell: (guess, target) => {
      if (target && target.rarity > guess.rarity) return `${guess.rarity} ⬆️`;
      if (target && target.rarity < guess.rarity) return `${guess.rarity} ⬇️`;
      return guess.rarity;
    },
  },
  {
    header: "Tags",
    getCellClass: createArrayMatchClass<OperatorDTO>("tagList"),
    renderCell: (guess) => {
      if (!Array.isArray(guess.tagList)) return "Error de config";
      return guess.tagList.join(", ");
    },
  },
];

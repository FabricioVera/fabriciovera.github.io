import type { Warframe } from "../types";

export interface WarframedleCONF {
  key: keyof Warframe;
  tableHeaderName: string;
  displayType: "boolean" | "image" | "higher/lower" | "partial" | "equal";
}

export const WARFRAMEDLECONFIG: WarframedleCONF[] = [
  { key: "wikiaThumbnail", tableHeaderName: "Warframe", displayType: "image" },
  { key: "name", tableHeaderName: "Nombre", displayType: "equal" },
  { key: "isPrime", tableHeaderName: "Es Prime?", displayType: "boolean" },
  { key: "aura", tableHeaderName: "Aura", displayType: "equal" },
  { key: "sex", tableHeaderName: "Sexo", displayType: "equal" },
  { key: "playstyle", tableHeaderName: "Playstyle", displayType: "partial" },
  { key: "releaseYear", tableHeaderName: "Año", displayType: "higher/lower" },
];

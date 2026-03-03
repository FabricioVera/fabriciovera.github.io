/**
 * Entidad base genérica. Efectos: Ninguno.
 * @property {string} name - Nombre único.
 * @property {string} imageURL - URL de imagen (opcional).
 */
export interface BaseGameEntity {
  name: string;
  imageURL?: string;
}

export interface CharacterData {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  four_letter: string;
  four_letter_votes: number;
  image: string;
}

export type GameStatus = "error" | "loading" | "playing" | "won" | "lost";

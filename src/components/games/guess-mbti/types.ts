export interface CharacterData {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  four_letter: string;
  four_letter_votes: number;
  image: string;
}

export type GameStatus = "loading" | "playing" | "won" | "lost";

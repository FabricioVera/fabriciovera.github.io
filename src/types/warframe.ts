export interface Ability {
  uniqueName: string;
  name: string;
  description: string;
  imageName: string;
  cardImage?: string;
}

export interface Warframe {
  name: string;
  isPrime: boolean;
  aura: string;
  sex: string;
  playstyle: string[];
  releaseDate: string;
  abilities: Ability[];
  imageName: string;
  wikiaThumbnail: string;
}

export interface ParsedWarframe extends Omit<Warframe, "releaseDate"> {
  releaseYear: number;
}

export interface Suggestion {
  name: string;
  wikiaThumbnail: string;
}

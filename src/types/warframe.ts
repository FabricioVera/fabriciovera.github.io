export interface Ability {
  uniqueName: string;
  name: string;
  description: string;
  imageName: string;
  cardImage?: string;
}

export interface preWarframe {
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

export interface Warframe extends Omit<preWarframe, "releaseDate"> {
  imageURL: string;
  releaseYear: number;
}

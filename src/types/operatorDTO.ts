export interface OperatorDTO {
  name: string;
  imageURL: string;
  spriteURL: string;
  rarity: number;
  sex?: string;
  race?: string;
  affiliation: string;
  tagList: string[];
  class: string;
  branch: string;
  archetype: string;
  images: any;
  skills: {
    name: string;
    icon: string;
    sp: string;
    type: string;
    duration: string;
  }[];
  voice_actors: {
    jp: string;
    cn: string;
    en: string;
    kr: string;
    othercv: string;
    otherlang: string;
  };
  theme: string;
}

export interface Game {
  id: string;
  name: string;
  title: string;
  isAvailable: boolean;
  backgroundImage: string;
  frontImage: string;
  url: string;
  hideTitle?: boolean;
}

export const games: Game[] = [
  {
    id: "character-by-image",
    name: "Adivina Personaje Anime",
    title: "Adivina el personaje con una imagen",
    isAvailable: true,
    backgroundImage: "/img/bg-anime-character.jpg",
    frontImage: "/img/fg-Ryxga.png",
    url: "/games/character-by-image",
  },
  {
    id: "guess-mbti",
    name: "Adivina el MBTI",
    title: "Adivina el MBTI del personaje",
    isAvailable: true,
    backgroundImage: "/img/bg-anime-character.jpg",
    frontImage: "/img/fg-mbti2.png",
    url: "/games/guess-mbti",
  },
  {
    id: "warframedle",
    name: "WarframeDLE: Warframes",
    title: "WarframeDLE: Warframes",
    isAvailable: true,
    backgroundImage: "/img/bg-warframedle.webp",
    frontImage: "/img/WarframeOnly2.png",
    url: "/games/warframedle",
    hideTitle: true,
  },
  {
    id: "warframedleabilities",
    name: "WarframeDLE: Habilidades",
    title: "WarframeDLE: Habilidades",
    isAvailable: true,
    backgroundImage: "/img/bg-abilitydle.webp",
    frontImage: "/img/fg-abilitydle.webp",
    url: "/games/warframedleabilities",
    hideTitle: false,
  },
  {
    id: "arknightdle",
    name: "Arknightdle",
    title: "Arknightdle",
    isAvailable: true,
    backgroundImage: "/img/bg-arknightdle_optimized.webp",
    frontImage: "/img/Muelsyse.webp",
    url: "/games/arknightdle",
    hideTitle: false,
  },
  {
    id: "arknightdlevoicelines",
    name: "Arknightdle: VoiceLine",
    title: "Arknightdle: VoiceLine",
    isAvailable: true,
    backgroundImage: "/img/bg-arknightdle.webp",
    frontImage: "/img/Muelsyse.webp",
    url: "/games/arknightdlevoicelines",
    hideTitle: false,
  },
];

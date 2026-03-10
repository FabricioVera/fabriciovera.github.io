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

export interface GameLinked {
  id: string;
  name: string;
  title: string;
  url: string;
}

export const games: Game[] = [
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
  {
    id: "arknightdleability",
    name: "Arknightdle: Ability",
    title: "Arknightdle: Ability",
    isAvailable: true,
    backgroundImage: "/img/bg-arknightdle.webp",
    frontImage: "/img/Muelsyse.webp",
    url: "/games/arknightdleability",
    hideTitle: false,
  },
];

export const gamesArknightdle: GameLinked[] = [
  {
    id: "arknightdle",
    name: "AD-1",
    title: "Arknightdle: Classic",
    url: "/games/arknightdle",
  },
  {
    id: "arknightdlevoicelines",
    name: "AD-2",
    title: "Arknightdle: VoiceLine",
    url: "/games/arknightdlevoicelines",
  },
  {
    id: "arknightdleability",
    name: "AD-3",
    title: "Arknightdle: Ability",
    url: "/games/arknightdleability",
  },
];

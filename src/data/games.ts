export interface Game {
  id: string;
  name: string;
  title: string;
  isAvailable: boolean;
  backgroundImage: string;
  frontImage: string;
  url: string;
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
    name: "Warframe DLE",
    title: "Warframe DLE",
    isAvailable: true,
    backgroundImage: "/img/WarframeBackground.png",
    frontImage: "/img/WarframeOnly2.png",
    url: "/games/warframedle",
  },
  // Generación dinámica de los 3 juegos "Próximamente" para mantener DRY
  ...Array.from({ length: 3 }).map((_, index) => ({
    id: `coming-soon-${index + 3}`,
    name: `coming-soon-${index + 3}`,
    title: "Próximamente",
    isAvailable: false,
    backgroundImage: "/img/bg-anime-character.jpg",
    frontImage: "/img/fg-placeholder.png",
    url: "",
  })),
];

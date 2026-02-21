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
    id: "1",
    name: "character-by-image",
    title: "Adivina el personaje con una imagen",
    isAvailable: true,
    backgroundImage: "/img/bg-anime-character.jpg",
    frontImage: "/img/fg-Ryxga.png",
    url: "/games/character-by-image",
  },
  {
    id: "2",
    name: "guess-mbti",
    title: "Adivina el MBTI del personaje",
    isAvailable: true,
    backgroundImage: "/img/bg-anime-character.jpg",
    frontImage: "/img/fg-mbti2.png",
    url: "/games/guess-mbti",
  },
  // Generación dinámica de los 4 juegos "Próximamente" para mantener DRY
  ...Array.from({ length: 4 }).map((_, index) => ({
    id: `coming-soon-${index + 3}`,
    name: `coming-soon-${index + 3}`,
    title: "Próximamente",
    isAvailable: false,
    backgroundImage: "/img/bg-anime-character.jpg",
    frontImage: "/img/front-placeholder.png",
    url: "#",
  })),
];

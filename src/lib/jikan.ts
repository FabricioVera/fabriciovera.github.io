import type { Anime, Character } from "../types/api";

const JIKAN_BASE = "https://api.jikan.moe/v4";

// Función para obtener un personaje aleatorio
// Nota: Jikan tiene un endpoint 'random', pero a veces devuelve cosas oscuras.
// Una estrategia mejor para un juego es tener una lista de IDs populares o usar 'top characters' y paginar aleatoriamente.
export async function getRandomCharacter(): Promise<Character | null> {
  try {
    const response = await fetch(`${JIKAN_BASE}/random/character`);
    if (!response.ok) throw new Error("Error fetching random character");

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getRandomAnime(): Promise<Anime | null> {
  try {
    const response = await fetch(`${JIKAN_BASE}/random/anime`);
    if (!response.ok) throw new Error("Error fetching random anime");

    const data = await response.json();
    return {
      mal_id: data.mal_id,
      title: data.title,
      images: { jpg: { image_url: data.images.jpg.image_url } },
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getTopCharacters(
  page: number = 1,
  limit: number = 25,
): Promise<Character[]> {
  try {
    const response = await fetch(
      `${JIKAN_BASE}/characters?page=${page}&limit=${limit}`,
    );
    if (!response.ok) throw new Error("Error fetching top characters");

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRandomTopCharacter(): Promise<Character | null> {
  try {
    // Jikan tiene alrededor de 1000 páginas de personajes top (con 25 por página)
    const randomPage = Math.floor(Math.random() * 20) + 1;
    const characters = await getTopCharacters(randomPage);
    if (characters.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getTopAnimes(page: number = 1, limit: number = 25) {
  try {
    const response = await fetch(
      `${JIKAN_BASE}/top/anime?page=${page}&limit=${limit}`,
    );
    if (!response.ok) throw new Error("Error fetching top anime");

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getRandomTopAnime(): Promise<Anime | null> {
  try {
    const randomPage = Math.floor(Math.random() * 20) + 1;
    const animes = await getTopAnimes(randomPage);
    if (animes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * animes.length);
    return animes[randomIndex];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getRandomCharacterByAnime(
  animeId: number,
): Promise<Character | null> {
  try {
    const response = await fetch(`${JIKAN_BASE}/anime/${animeId}/characters`);
    if (!response.ok) throw new Error("Error fetching characters by anime");
    const { data } = await response.json();
    if (data.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex].character;
  } catch (error) {
    console.error(error);
    return null;
  }
}

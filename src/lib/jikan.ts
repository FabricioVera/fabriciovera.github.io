import type { Character } from "../types/api";

const JIKAN_BASE = "https://api.jikan.moe/v4";

// Función para obtener un personaje aleatorio
// Nota: Jikan tiene un endpoint 'random', pero a veces devuelve cosas oscuras.
// Una estrategia mejor para un juego es tener una lista de IDs populares o usar 'top characters' y paginar aleatoriamente.
export async function getRandomCharacter(): Promise<Character | null> {
  try {
    const response = await fetch(`${JIKAN_BASE}/random/characters`);
    if (!response.ok) throw new Error("Error fetching character");

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

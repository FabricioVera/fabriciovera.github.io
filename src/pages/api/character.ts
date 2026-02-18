import type { APIRoute } from "astro";
import {
  getRandomAnime,
  getRandomCharacter,
  getRandomCharacterByAnime,
  getRandomTopAnime,
  getRandomTopCharacter,
} from "../../lib/jikan";

const personalityCache = new Map<string, any>();

export const GET: APIRoute = async () => {
  // Aquí podrías agregar lógica para reintentar si sale un personaje sin imagen, etc.
  const anime = await getRandomTopAnime();
  const character = await getRandomCharacterByAnime(anime?.mal_id || 1); // Fallback a ID 1 si no hay anime

  if (!character) {
    return new Response(JSON.stringify({ error: "No data" }), { status: 500 });
  }

  const animeTitle = anime?.title || "Unknown Anime";

  // Sanitizamos la respuesta para el frontend
  const payload = {
    id: character.mal_id,
    name: character.name,
    image: character.images.jpg.image_url,
    anime: animeTitle,
  };
  console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

import type { APIRoute } from "astro";
import { getRandomCharacter } from "../../lib/jikan";

export const GET: APIRoute = async () => {
  // Aquí podrías agregar lógica para reintentar si sale un personaje sin imagen, etc.
  const character = await getRandomCharacter();

  if (!character) {
    return new Response(JSON.stringify({ error: "No data" }), { status: 500 });
  }

  // Sanitizamos la respuesta para el frontend
  const payload = {
    id: character.mal_id,
    name: character.name,
    image: character.images.jpg.image_url,
    // Pista opcional: el anime del que viene
    anime: character.anime?.[0]?.anime?.title || "Unknown",
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

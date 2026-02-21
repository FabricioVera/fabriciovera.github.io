import type { APIRoute } from "astro";
import { getRandomCharacterByAnime, getRandomTopAnime } from "@lib/jikan";

export const GET: APIRoute = async () => {
  try {
    console.log("Fetching random top anime...");
    const anime = await getRandomTopAnime();
    if (!anime) throw new Error("No anime found");

    const character = await getRandomCharacterByAnime(anime.mal_id);

    if (
      !character ||
      !character.images?.jpg?.image_url ||
      character.images.jpg.image_url.includes("questionmark")
    ) {
      return new Response(
        JSON.stringify({ error: "Personaje inválido o sin imagen" }),
        { status: 404 },
      );
    }

    const payload = {
      id: character.mal_id,
      name: character.name,
      image: character.images.jpg.image_url,
      anime: anime.title,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching character:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch character" }),
      { status: 500 },
    );
  }
};

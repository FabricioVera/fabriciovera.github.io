import type { APIRoute } from "astro";
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

interface CsvCharacter {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  four_letter: string; // El MBTI (ej: INTJ)
  four_letter_total_voted: string;
  // ... otros campos si los necesitas
}

export const GET: APIRoute = async () => {
  try {
    const csvPath = path.join(process.cwd(), "src/data/mbti_characters.csv");
    const fileContent = fs.readFileSync(csvPath, "utf8");

    const { data } = Papa.parse<CsvCharacter>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const popularCharacters = data
      .map((char) => ({
        ...char,
        votes: parseInt(char.four_letter_total_voted || "0", 10),
      }))
      .filter((char) => char.votes > 50);

    if (popularCharacters.length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay personajes populares" }),
        { status: 404 },
      );
    }

    // Devolvemos TODOS
    return new Response(JSON.stringify(popularCharacters), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server Error" }), {
      status: 500,
    });
  }
};

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
    // 1. Localizar el archivo CSV
    // process.cwd() apunta a la raíz del proyecto
    const csvPath = path.join(process.cwd(), "src/data/mbti_characters.csv");
    const fileContent = fs.readFileSync(csvPath, "utf8");

    // 2. Parsear el CSV
    const { data } = Papa.parse<CsvCharacter>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    // 3. Filtrar por popularidad
    // Convertimos a número y filtramos los que tengan, por ejemplo, más de 50 votos
    const popularCharacters = data.filter((char) => {
      const votes = parseInt(char.four_letter_total_voted || "0", 10);
      return votes > 50;
    });

    if (popularCharacters.length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay personajes populares" }),
        { status: 404 },
      );
    }

    // 4. Seleccionar uno al azar
    const randomIndex = Math.floor(Math.random() * popularCharacters.length);
    const character = popularCharacters[randomIndex];

    // 5. Construir respuesta (ocultamos la respuesta correcta en 'solution', enviamos pistas)
    // TRUCO: PDB suele guardar las imágenes usando el ID. Intentaremos reconstruir la URL.
    const imageUrl = `https://personality-database.com/profile_images/${character.id}.png`;
    // Nota: Si la imagen falla en el frontend, pondremos un placeholder.

    return new Response(
      JSON.stringify({
        id: character.id,
        name: character.name,
        category: character.category,
        subcategory: character.subcategory,
        image: imageUrl,
        solution: character.four_letter, // El MBTI correcto
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Server Error" }), {
      status: 500,
    });
  }
};

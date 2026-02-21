import { supabase } from "@lib/supabase";
import type { ScoreEntry } from "src/types/score";

export async function saveHighScore(
  gameId: string,
  playerName: string,
  score: number,
): Promise<void> {
  if (score <= 0) return;
  const { data: existingScore, error: fetchError } = await supabase
    .from("leaderboard")
    .select("score")
    .eq("game_id", gameId)
    .eq("player_name", playerName);

  if (fetchError) {
    console.error("Error al obtener el puntaje existente:", fetchError);
    return;
  }
  for (let i = 0; i < existingScore.length; i++) {
    if (existingScore[i].score >= score) {
      console.log(
        "El puntaje no es mayor a los existentes, no se actualizará.",
      );
      return;
    }
  }
  const { error } = await supabase
    .from("leaderboard")
    .insert([{ game_id: gameId, player_name: playerName, score }]);

  if (error) {
    console.error("Error al guardar el puntaje:", error);
    // Aquí podrías implementar un sistema de telemetría o manejo de errores global
  }
  console.log("Puntaje guardado exitosamente");
}

export async function getTopScores(
  gameId: string,
  limit: number = 10,
): Promise<ScoreEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("id, player_name, score, created_at")
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error al obtener el leaderboard:", error);
    return [];
  }

  return data as ScoreEntry[];
}

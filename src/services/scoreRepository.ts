import { supabase } from "@lib/supabase";

export interface ScoreEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export async function saveHighScore(
  gameId: string,
  playerName: string,
  score: number,
): Promise<void> {
  if (score <= 0) return;

  const { error } = await supabase
    .from("leaderboard")
    .insert([{ game_id: gameId, player_name: playerName, score }]);

  if (error) {
    console.error("Error al guardar el puntaje:", error);
    // Aquí podrías implementar un sistema de telemetría o manejo de errores global
  }
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

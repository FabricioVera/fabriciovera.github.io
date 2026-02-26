import { supabase } from "@lib/supabase";
import type { ScoreEntry, TopScore } from "src/types/score";

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
  timeLimit: string = "no-limit",
): Promise<TopScore[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("player_name, score")
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error al obtener el leaderboard:", error);
    return [];
  }

  return data as TopScore[];
}

export async function saveDailyScore(
  gameId: string,
  playerName: string,
  score: number,
): Promise<void> {
  if (score <= 0) return;
  const { start, end } = getTodayRange();

  const { data: existingRecord, error: fetchError } = await supabase
    .from("leaderboard")
    .select("id, score")
    .eq("game_id", gameId)
    .eq("player_name", playerName)
    .gte("created_at", start)
    .lt("created_at", end)
    .maybeSingle();

  if (fetchError)
    throw new Error(`Error al obtener el puntaje: ${fetchError.message}`);

  if (existingRecord && existingRecord.score >= score) {
    console.log("El puntaje no supera al récord de hoy. No se actualizará.");
    return;
  }
  console.log("se encontró: " + existingRecord);

  try {
    if (existingRecord) {
      const { error: updateError } = await supabase
        .from("leaderboard")
        .update({ score })
        .eq("id", existingRecord.id);

      if (updateError)
        throw new Error(`Error al actualizar: ${updateError.message}`);
    } else {
      const { error: insertError } = await supabase.from("leaderboard").insert([
        {
          game_id: gameId,
          player_name: playerName,
          score,
        },
      ]);

      if (insertError)
        throw new Error(`Error al insertar: ${insertError.message}`);
    }

    console.log("Puntaje diario guardado exitosamente");
  } catch (error) {
    console.error("[LeaderboardService] Error en saveDailyScore:", error);
  }
}

export async function getDailyTopScores(
  gameId: string,
  ascending: boolean,
  limit: number = 10,
): Promise<TopScore[]> {
  const { start, end } = getTodayRange();

  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("player_name, score")
      .eq("game_id", gameId)
      .gte("created_at", start)
      .lt("created_at", end)
      .order("score", { ascending: ascending })
      .limit(limit);

    if (error) throw new Error(error.message);

    return data || [];
  } catch (error) {
    console.error(
      "[LeaderboardService] Error al obtener el top diario:",
      error,
    );
    return [];
  }
}

export interface DateRange {
  start: string;
  end: string;
}

export const getTodayRange = (): DateRange => {
  const now = new Date();

  // Establecemos las 00:00:00.000 de HOY (Hora local del jugador)
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  // Establecemos las 00:00:00.000 de MAÑANA (Hora local del jugador)
  const startOfNextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );

  return {
    start: startOfDay.toISOString(), // Ej: "2026-02-24T03:00:00.000Z" (Si el cliente es UTC-3)
    end: startOfNextDay.toISOString(),
  };
};

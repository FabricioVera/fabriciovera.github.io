import { supabase } from "@lib/supabase";
import type { TopScore } from "src/types/score";
import { logger } from "./logger";

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 1) throw error;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs);
  }
}

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
    .eq("player_name", playerName)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    logger.error("Error al obtener el puntaje existente:", fetchError);
    return;
  }

  if (existingScore && existingScore.score >= score) {
    logger.warn("El puntaje no es mayor a los existentes, no se actualizará.");
    return;
  }
  const { error } = await supabase
    .from("leaderboard")
    .insert([{ game_id: gameId, player_name: playerName, score }]);

  if (error) {
    logger.error("Error al guardar el puntaje:", error);
    // Aquí podrías implementar un sistema de telemetría o manejo de errores global
  }
  logger.info("Puntaje guardado exitosamente");
}

export async function getTopScores(
  gameId: string,
  limit: number = 10,
): Promise<TopScore[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("player_name, score")
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error("Error al obtener el leaderboard: ", error);
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

  if (fetchError) {
    logger.error(`Error al obtener el puntaje: ${fetchError.message}`);
  }

  if (existingRecord) {
    logger.warn("El puntaje no supera al récord de hoy. No se actualizará.");
    return;
  }

  logger.info("se encontró: " + existingRecord);

  const payload = {
    game_id: gameId,
    player_name: playerName,
    score,
  };

  const maxRetries = 3;
  const retryDelay = 500;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error: insertError } = await supabase
        .from("leaderboard")
        .insert([payload]);

      if (!insertError) {
        logger.info("Puntaje diario guardado exitosamente");
        return;
      }

      throw insertError;
    } catch (error: any) {
      logger.error(`Intento ${attempt}/${maxRetries} falló: ${error.message}`);

      if (attempt === maxRetries) {
        logger.error(
          "[LeaderboardService] Error final en saveDailyScore:",
          error,
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
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
    logger.error("[LeaderboardService] Error al obtener el top diario:", error);
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

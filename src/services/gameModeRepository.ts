import { logger } from "./logger";

export type GameMode = "daily" | "random";

export const gameModeRepository = {
  save: (gameId: string, mode: GameMode | string): void => {
    try {
      if (typeof document === "undefined") return;

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Formato: gameId-GameMode=daily; expires=...; path=/; SameSite=Lax
      document.cookie = `${gameId}-GameMode=${mode};expires=${endOfDay.toUTCString()};path=/;SameSite=Lax`;
    } catch (error) {
      logger.error(`[gameModeRepository] Error al guardar cookie para ${gameId}:`, error);
    }
  },

  load: (gameId: string): GameMode | null => {
    try {
      if (typeof document === "undefined") return null;

      const match = document.cookie.match(
        new RegExp(`(?:^|; )${gameId}-GameMode=([^;]+)`),
      );
      if (match && (match[1] === "daily" || match[1] === "random")) {
        return match[1] as GameMode;
      }
      return null;
    } catch (error) {
      logger.error(`[gameModeRepository] Error al leer cookie para ${gameId}:`, error);
      return null;
    }
  },
};

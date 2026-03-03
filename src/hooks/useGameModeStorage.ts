import { useState } from "react";
import { logger } from "../services/logger";

export function useGameModeStorage({ gameId }: { gameId: string }) {
  const [gameMode, setGameMode] = useState<string>(() => {
    try {
      const savedGameMode = localStorage.getItem(`${gameId}-GameMode`);
      logger.info(
        "Se obtuvo del local storage el siguiente gamemode: " + savedGameMode,
      );
      return savedGameMode ? savedGameMode : "daily";
    } catch (e) {
      logger.error("error al cargar modo de juego del local storage: ", e);
      return "daily";
    }
  });

  const setGameModeValue = (value: string) => {
    try {
      setGameMode(value);
      localStorage.setItem(`${gameId}-GameMode`, value);
    } catch (e) {
      logger.error("error al guardar modo de juego del local storage: ", e);
    }
  };

  return { gameMode, setGameModeValue };
}

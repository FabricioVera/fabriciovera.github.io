import { useState } from "react";
import { gameModeRepository, type GameMode } from "@services/gameModeRepository";

export function useGameModeStorage({ gameId }: { gameId: string }) {
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    return gameModeRepository.load(gameId) || "daily";
  });

  const setGameModeValue = (value: GameMode | string) => {
    const validMode = (value === "daily" || value === "random") ? value : "daily";
    setGameMode(validMode);
    gameModeRepository.save(gameId, validMode);
  };

  return { gameMode, setGameModeValue };
}

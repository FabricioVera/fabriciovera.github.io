import { useState, useCallback } from "react";
import { saveHighScore } from "../services/scoreRepository";
import { $playerName } from "../store/playerStore";

export function useGameScore(gameId: string) {
  const [score, setScore] = useState(0);

  const incrementScore = useCallback(() => {
    setScore((prev) => prev + 1);
  }, []);

  const resetScore = useCallback(() => {
    const currentPlayer = $playerName.get();

    // Si hay un jugador registrado y logró más de 0 puntos, lo guardamos asíncronamente
    if (currentPlayer && score > 0) {
      saveHighScore(gameId, currentPlayer, score);
    }

    console.log(`Puntaje para ${currentPlayer} en ${gameId}: ${score}`);
    setScore(0);
  }, [score, gameId]);

  return { score, incrementScore, resetScore };
}

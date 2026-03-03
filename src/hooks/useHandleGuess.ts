import { useState } from "react";
import type { GameStatus } from "src/types/game";
import { saveDailyScore } from "@services/scoreRepository";

const MAX_DAILY_ATTEMPTS = Infinity;

export function useHandleGuess(
  target: any,
  operators: any[] | undefined,
  playerName: string | null,
  gameId: string,
  gameMode: string = "daily",
  gameStatus: GameStatus,
  setGameStatus: (gameStatus: GameStatus) => void,
) {
  const [guesses, setGuesses] = useState<any[]>([]);

  const handleGuess = (name: string): void => {
    if (gameStatus !== "playing" || !operators || !target) return;

    const guessedOp = operators.find((op) => op.name === name);

    //* no permite adivinar duplicados
    if (!guessedOp || guesses.some((g) => g.name === name)) return;

    const newGuesses = [guessedOp, ...guesses];
    setGuesses(newGuesses);

    //* Lógica de victoria/derrota
    const isWin = guessedOp.name === target?.name;

    if (isWin) {
      setGameStatus("won");
      if (gameMode === "daily" && playerName) {
        saveDailyScore(gameId, playerName, newGuesses.length);
      }
    } else if (newGuesses.length >= MAX_DAILY_ATTEMPTS) {
      setGameStatus("lost");
      if (gameMode === "daily" && playerName) {
        saveDailyScore(gameId, playerName, newGuesses.length);
      }
    }
  };

  /**
   * * LIMPIA LA LISTA DE GUESSES
   */
  const clearGuesses = () => {
    setGuesses([]);
  };

  return {
    guesses,
    setGuesses,
    clearGuesses,
    gameStatus,
    setGameStatus,
    handleGuess,
  };
}

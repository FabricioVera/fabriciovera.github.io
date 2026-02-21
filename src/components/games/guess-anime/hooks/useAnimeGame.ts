import { set } from "astro:schema";
import { useState, useEffect, useCallback } from "react";
import type { GameStatus } from "src/types/game";

interface GameCharacter {
  name: string;
  image: string;
  anime: string;
}

export function useAnimeGame() {
  const [status, setStatus] = useState<GameStatus>("playing");
  const [character, setCharacter] = useState<GameCharacter | null>(null);

  // Fetch a TU propia API, no a Jikan directamente
  const loadNewCharacter = useCallback(async () => {
    setStatus("loading");
    try {
      let success = false;
      let attempts = 0;
      while (!success && attempts < 5) {
        const res = await fetch("/api/character");
        const data = await res.json();
        if (data.error) {
          attempts++;
          continue;
        }
        setCharacter(data);
        success = true;
      }
      if (!success) setStatus("error");
      setStatus("playing");
    } catch (error) {
      console.error("Error cargando personaje:", error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadNewCharacter();
  }, []);

  const checkGuess = (guess: string) => {
    if (!character) return;
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedName = character.name.trim().toLowerCase();

    const nameParts = normalizedName.split("");
    const isPartialMatch = nameParts.includes(normalizedGuess);

    if (normalizedGuess === normalizedName || isPartialMatch) {
      setStatus("won");
    } else {
      setStatus("lost");
    }
  };
  return { character, status, checkGuess, loadNewCharacter };
}

import { useState, useEffect, useCallback, useRef } from "react";
import type { CharacterData, GameStatus } from "../types";
import charactersData from "@data/mbti_characters.json";

export function useMbtiGame(characters: CharacterData[]) {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [status, setStatus] = useState<GameStatus>("loading");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const pickRandomCharacter = useCallback(() => {
    if (!characters.length) {
      setStatus("lost");
      return;
    }

    let randomIndex;
    let newCharacter;

    do {
      randomIndex = Math.floor(Math.random() * characters.length);
      newCharacter = characters[randomIndex];
    } while (characters.length > 1 && newCharacter.id === character?.id);

    setCharacter(newCharacter);
    setSelectedType(null);
    setStatus("playing");
  }, [characters, character?.id]);

  const handleGuess = useCallback(
    (type: string) => {
      if (!character || status !== "playing") return;

      setSelectedType(type);
      setStatus(type === character.four_letter ? "won" : "lost");
    },
    [character, status],
  );

  useEffect(() => {
    pickRandomCharacter();
  }, []);

  return { character, status, selectedType, pickRandomCharacter, handleGuess };
}

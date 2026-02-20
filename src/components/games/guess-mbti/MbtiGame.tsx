import charactersData from "@data/mbti_characters.json";
import { CharacterCard } from "./components/CharacterCard";
import type { CharacterData } from "./types";
import { useMbtiGame } from "./hooks/useMbtiGame";
import { MbtiBoard } from "./components/MbtiBoard";

const allCharacters = charactersData as CharacterData[];

export default function MbtiGame() {
  const { character, status, selectedType, pickRandomCharacter, handleGuess } =
    useMbtiGame(allCharacters);

  if (status === "loading")
    return (
      <div className="text-white p-10 text-center animate-pulse">
        Cargando mbti...
      </div>
    );

  if (!character)
    return (
      <div className="text-red-500 text-center p-10">Error al cargar datos</div>
    );

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      <CharacterCard
        character={character}
        status={status}
        onNext={pickRandomCharacter}
      />

      <MbtiBoard
        status={status}
        correctType={character.four_letter}
        selectedType={selectedType}
        onGuess={handleGuess}
        character={character}
        onNext={pickRandomCharacter}
      />
    </div>
  );
}

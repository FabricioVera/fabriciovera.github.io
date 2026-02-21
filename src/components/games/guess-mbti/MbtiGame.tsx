import { useStore } from "@nanostores/react";
import charactersData from "@data/mbti_characters.json";
import { CharacterCard } from "./components/CharacterCard";
import type { CharacterData } from "./types";
import { useMbtiGame } from "./hooks/useMbtiGame";
import { MbtiBoard } from "./components/MbtiBoard";
import { $playerName } from "@store/playerStore";
import { useGameScore } from "@hooks/useGameScore";
import NameForm from "@components/NameForm";
import { Pointer } from "@components/index";

const allCharacters = charactersData as CharacterData[];

export default function MbtiGame() {
  const playerName = useStore($playerName);
  const { score, incrementScore, resetScore } = useGameScore("guess-mbti");

  const { character, status, selectedType, pickRandomCharacter, handleGuess } =
    useMbtiGame({
      characters: allCharacters,
      onCorrectGuess: incrementScore,
      onIncorrectGuess: resetScore,
    });

  if (!playerName) {
    return <NameForm />;
  }

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
    <div className="max-w-4xl mx-auto flex flex-col gap-6 p-4">
      <Pointer playerName={playerName} score={score} />

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
    </div>
  );
}

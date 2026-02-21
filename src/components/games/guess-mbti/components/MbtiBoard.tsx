import type { GameStatus, CharacterData } from "../types";
import { MBTI_TYPES } from "../constants";

interface Props {
  status: GameStatus;
  correctType: string;
  selectedType: string | null;
  onGuess: (type: string) => void;
  character: CharacterData;
  onNext: () => void;
}

export function MbtiBoard({
  status,
  correctType,
  selectedType,
  onGuess,
  character,
  onNext,
}: Props) {
  const isGameOver = status !== "playing";
  const isWon = status === "won";
  const getButtonClasses = (type: string) => {
    const baseClass =
      "py-4 px-2 rounded-lg font-bold text-lg transition-all border-2 ";

    if (status === "playing") {
      return (
        baseClass +
        "bg-primary border-secondary text-white hover:bg-accent hover:border-white hover:text-white hover:scale-105 cursor-pointer"
      );
    }

    if (type === correctType) {
      return (
        baseClass +
        "bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]"
      );
    }

    if (type === selectedType && status === "lost") {
      return baseClass + "bg-red-600 border-red-400 text-white opacity-50";
    }

    return (
      baseClass + "bg-primary/80 border-secondary/80 text-slate-600 opacity-30"
    );
  };

  return (
    <div className="flex flex-col items-center">
      {isGameOver && (
        <p
          className={`text-lg font-bold mb-2 ${isWon ? "text-green-500" : "text-red-500"}`}
        >
          {isWon ? "¡Correcto!" : "¡Incorrecto!"}{" "}
          <span className="text-white">
            Es <span className="text-accent2">{character.four_letter}</span> con{" "}
            {character.four_letter_votes} votos totales.
          </span>
        </p>
      )}

      <div className="grid grid-cols-4 gap-3 content-center w-full my-auto">
        {MBTI_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => onGuess(type)}
            disabled={status !== "playing"}
            className={getButtonClasses(type)}
          >
            {type}
          </button>
        ))}
      </div>
      {isGameOver && (
        <button
          onClick={onNext}
          className="mt-4 bg-accent text-white px-6 py-2 rounded-full font-bold hover:bg-accent2 transition-colors"
        >
          Siguiente Personaje
        </button>
      )}
    </div>
  );
}

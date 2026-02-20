import type { CharacterData, GameStatus } from "../types";
import { FALLBACK_IMAGE } from "../constants";

interface Props {
  character: CharacterData;
  status: GameStatus;
  onNext: () => void;
}

export function CharacterCard({ character, status, onNext }: Props) {
  const isGameOver = status !== "playing";
  const isWon = status === "won";

  return (
    <div className="flex flex-col items-center align-center text-center h-full min-h-100 bg-primary p-6 rounded-xl border border-accent">
      <div className="w-60 h-60 mb-4 overflow-hidden rounded-2xl border-4 border-accent bg-primary">
        <img
          src={character.image || FALLBACK_IMAGE}
          alt={character.name}
          className="w-full h-full object-cover object-top"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="w-full max-w-70 flex flex-col justify-center flex-1">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 line-clamp-2">
          {character.name}
        </h2>
        <p className="text-accent2 text-sm line-clamp-2 min-h-10">
          {character.subcategory}
          {character.category !== character.subcategory &&
            ` - ${character.category}`}
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAnimeGame } from "./hooks/useAnimeGame";
import Pointer from "../Pointer";
import { useStore } from "@nanostores/react";
import { $playerName } from "../../../store/playerStore";
import NameForm from "../../NameForm";

export default function GameContainer() {
  const playerName = useStore($playerName);
  const { character, status, checkGuess, loadNewCharacter } = useAnimeGame();
  const [guess, setGuess] = useState("");

  if (!playerName) {
    return <NameForm />;
  }

  const handleGuess = () => {
    if (guess.trim() === "") return;
    checkGuess(guess);
  };

  const handleNext = () => {
    setGuess("");
    loadNewCharacter();
  };

  if (status === "loading") {
    return (
      <div className="text-white text-center p-10 animate-pulse">
        Buscando personaje en la base de datos de la Jikan...
      </div>
    );
  }

  if (status === "error" || !character) {
    return (
      <div className="text-center text-red-500 p-10">
        Hubo un error cargando el personaje.
        <button onClick={handleNext} className="ml-4 underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-md mx-auto p-4 bg-primary rounded-xl shadow-lg border border-secondary">
        <div className="relative mb-4 overflow-hidden rounded-lg">
          <img
            src={character.image}
            alt="Character to guess"
            className={`w-full h-full object-cover transition-all duration-500`}
          />
        </div>

        {status === "playing" ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="flex-1 bg-secondary text-white p-2 rounded border border-accent"
              placeholder="Nombre del personaje..."
              onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            />
            <button
              onClick={handleGuess}
              className="bg-secondary hover:bg-accent text-white px-4 py-2 rounded font-bold transition-colors"
            >
              Adivinar
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h2
              className={`text-2xl font-bold mb-4 ${status === "won" ? "text-green-400" : "text-red-400"}`}
            >
              {status === "won" ? "¡Correcto!" : `Era ${character.name}`}
            </h2>
            <button
              onClick={loadNewCharacter}
              className="bg-secondary hover:bg-accent text-white px-6 py-2 rounded-full font-bold"
            >
              Siguiente Personaje
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";

interface GameCharacter {
  name: string;
  image: string;
  anime: string;
}

export default function GameContainer() {
  const [character, setCharacter] = useState<GameCharacter | null>(null);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");

  // Fetch a TU propia API, no a Jikan directamente
  const loadNewCharacter = async () => {
    setStatus("playing");
    setGuess("");
    const res = await fetch("/api/character");
    const data = await res.json();
    setCharacter(data);
  };

  useEffect(() => {
    loadNewCharacter();
  }, []);

  const handleGuess = () => {
    if (!character) return;
    // Lógica simple de comparación (puedes usar librerías de distancia de strings para ser más permisivo)
    if (guess.toLowerCase() === character.name.toLowerCase()) {
      setStatus("won");
    } else {
      setStatus("lost"); // O restar vidas
    }
  };

  if (!character)
    return <div className="animate-pulse">Cargando waifu/husbando...</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <img
          src={character.image}
          alt="Character to guess"
          className={`w-full h-full object-cover transition-all duration-500`}
          // Tip de juego: Inicia con blur y ve quitándolo si piden pistas
        />
      </div>

      {status === "playing" ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="flex-1 bg-slate-900 text-white p-2 rounded border border-slate-600"
            placeholder="Nombre del personaje..."
            onKeyDown={(e) => e.key === "Enter" && handleGuess()}
          />
          <button
            onClick={handleGuess}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold transition-colors"
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
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-bold"
          >
            Siguiente Personaje
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";

// Los 16 tipos de personalidad
const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
];

interface CharacterData {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  four_letter: string;
}

export default function MbtiGame() {
  const [allCharacters, setAllCharacters] = useState<CharacterData[]>([]);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "won" | "lost">(
    "loading",
  );
  const [selectedType, setSelectedType] = useState<string | null>(null);
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        const res = await fetch("/api/game/mbti");
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No characters found");
        }

        setAllCharacters(data);
        pickRandomCharacter(data);
      } catch (err) {
        console.error(err);
        setStatus("lost");
      }
    };

    loadCharacters();
  }, []);

  const pickRandomCharacter = (list = allCharacters) => {
    if (!list.length) return;

    let randomIndex;
    let newCharacter;

    do {
      randomIndex = Math.floor(Math.random() * list.length);
      newCharacter = list[randomIndex];
    } while (list.length > 1 && newCharacter.id === character?.id);

    setCharacter(newCharacter);
    setSelectedType(null);
    setStatus("playing");
  };

  const handleGuess = (type: string) => {
    if (status !== "playing" || !character) return;

    setSelectedType(type);

    if (type === character.four_letter) {
      setStatus("won");
    } else {
      setStatus("lost");
    }
  };

  if (status === "loading")
    return (
      <div className="text-white p-10 text-center animate-pulse">
        Cargando mbti...
      </div>
    );
  if (!character)
    return <div className="text-red-500">Error al cargar datos</div>;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
      {/* Columna Izquierda */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
        <div className="w-48 h-48 mb-4 overflow-hidden rounded-full border-4 border-slate-600 bg-slate-900">
          <img
            src={character.image}
            alt={character.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
            }}
          />
        </div>

        <h2 className="text-3xl font-bold text-white mb-1">{character.name}</h2>

        <p className="text-slate-400 text-sm mb-6">
          {character.category} - {character.subcategory}
        </p>

        {status !== "playing" && (
          <div
            className={`p-4 rounded-lg w-full ${
              status === "won"
                ? "bg-green-900/50 border border-green-500"
                : "bg-red-900/50 border border-red-500"
            }`}
          >
            <p className="text-lg font-bold text-white mb-2">
              {status === "won" ? "¡Correcto!" : "Incorrecto"}
            </p>

            <p className="text-slate-200">
              Es{" "}
              <span className="text-2xl font-bold text-yellow-400 mx-1">
                {character.four_letter}
              </span>
            </p>

            <button
              onClick={() => pickRandomCharacter()}
              className="mt-4 bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-slate-200 transition-colors"
            >
              Siguiente Personaje
            </button>
          </div>
        )}
      </div>

      {/* Columna Derecha */}
      <div className="grid grid-cols-4 gap-3 content-start">
        {MBTI_TYPES.map((type) => {
          let btnClass =
            "py-4 rounded-lg font-bold text-lg transition-all border-2 ";

          if (status === "playing") {
            btnClass +=
              "bg-slate-700 border-slate-600 text-slate-300 hover:bg-blue-600 hover:border-blue-400 hover:text-white hover:scale-105 cursor-pointer";
          } else {
            if (type === character.four_letter) {
              btnClass +=
                "bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]";
            } else if (type === selectedType && status === "lost") {
              btnClass += "bg-red-600 border-red-400 text-white opacity-50";
            } else {
              btnClass +=
                "bg-slate-800 border-slate-700 text-slate-600 opacity-30 cursor-not-allowed";
            }
          }

          return (
            <button
              key={type}
              onClick={() => handleGuess(type)}
              disabled={status !== "playing"}
              className={btnClass}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}

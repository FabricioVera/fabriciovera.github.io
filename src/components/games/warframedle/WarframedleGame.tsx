// DATA
import warframeData from "@data/Warframes_final.json";
import { $playerName } from "@store/playerStore";

// COMPONENTES
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";
import Pointer from "../../ui/Pointer";
import { RequirePlayer } from "@auth/index";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";

//HOOKS + UTILS
import useWarframedle from "./hooks/useWarframedle";
import { useStore } from "@nanostores/react";
import { getWikiThumbnail, getWarframeThumbnailName } from "@utils/index";

// TYPES
import type { preWarframe } from "src/types/warframe";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";

// CONFIGS
import { warframedleColumns } from "@config/gameTableColumns";

interface WarframedleGameProps {
  gameId: string;
}

export default function WarframedleGame({ gameId }: WarframedleGameProps) {
  const playerName = useStore($playerName);

  // ESTADO DEL JUEGO
  const {
    warframes,
    targetWarframe,
    attemptsLeft,
    gameMode,
    guesses,
    status,
    handleGuess,
    startDailyMode,
    startRandomMode,
  } = useWarframedle(warframeData as preWarframe[], gameId, playerName);
  const guessedNames = guesses.map((g) => g.name);

  const currentHeroWf =
    status === "playing"
      ? { name: "WARFRAMEDLE", wikiaThumbnail: undefined }
      : {
          name: targetWarframe.name,
          imageURL: getWikiThumbnail(
            getWarframeThumbnailName(targetWarframe.name),
          ),
        };

  const GameModeConfig: GameModeCONF[] = [
    { gameModeName: "daily", gameModeHook: startDailyMode },
    { gameModeName: "random", gameModeHook: startRandomMode },
  ];

  const suggestions = warframes.map((wf) => ({
    name: wf.name,
    imageURL: getWikiThumbnail(getWarframeThumbnailName(wf.name)),
  }));

  return (
    <RequirePlayer>
      <div className="min-h-screen w-full max-w-[100vw] lg:max-w-5xl mx-auto p-4 flex flex-col lg:items-center gap-6 overflow-auto">
        {gameMode === "daily" && (
          <Pointer
            className="bg-primary/60 border border-accent text-white shadow-[0_0_25px_var(--color-accent)]"
            playerName={playerName}
            score={guesses.length}
            gameId={gameId}
            isDaily={true}
            ascending={true}
            pointsName="Intentos"
          />
        )}
        <GameModeSelector
          gameModeCONF={GameModeConfig}
          actualGameMode={gameMode}
        />
        <div className="relative w-auto mx-auto flex flex-col justify-center items-center text-center">
          {currentHeroWf.imageURL && (
            <img
              className={`w-full h-[35vh] object-cover object-top pointer-events-none bg-primary/50 border border-accent text-white rounded-lg p-4`}
              src={currentHeroWf.imageURL}
              alt=""
            />
          )}
          <h1
            className={`bottom-5 text-2xl md:text-4xl font-bold text-center px-4 drop-shadow-lg tracking-wider transition-colors duration-300 ${
              status === "playing"
                ? "bg-linear-to-r from-(--color-accent) via-accent2 to-(--highlight) bg-clip-text text-transparent drop-shadow-[0_0_20px_var(--color-accent)]"
                : "absolute text-white drop-shadow-[0_0_15px_var(--color-accent)] css-3d-text"
            }`}
          >
            {currentHeroWf.name}
          </h1>
        </div>

        {status === "playing" && (
          <div>
            <AutocompleteInput
              onGuess={handleGuess}
              suggestionList={suggestions}
              guessedNames={guessedNames}
              placeholder="Ash, Mirage, Zephyr..."
            />
            {gameMode === "daily" && (
              <p className="text-secondary font-semibold">
                Intentos restantes:{" "}
                <span className="text-accent">{attemptsLeft}</span>
              </p>
            )}
          </div>
        )}

        {guesses.length > 0 && (
          <div className="overflow-x-auto justify-items-start rounded-2xl border border-(--border) bg-primary shadow-[0_0_30px_rgba(0,0,0,0.6)] mt-4 text-white">
            <table className="w-full">
              <TableHeader columns={warframedleColumns} />
              <tbody>
                {guesses.map((guess, index) => {
                  // Necesitas buscar el objeto completo basado en el string almacenado
                  const guessObj = warframes.find((w) => w.name === guess.name);
                  if (!guessObj) return null;

                  return (
                    <tr
                      key={index}
                      className="bg-secondary hover:bg-primary transition-colors text-center"
                    >
                      {warframedleColumns.map((col, colIndex) => (
                        <TableCell
                          key={colIndex}
                          guess={guessObj}
                          target={
                            targetWarframe
                          } /* Ajusta el tipo según tu target real */
                          columnDef={col}
                        />
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequirePlayer>
  );
}

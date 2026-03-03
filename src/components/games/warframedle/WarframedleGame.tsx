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

// TYPES
import type { preWarframe } from "src/types/warframe";

// CONFIGS
import { warframedleColumns } from "@config/gameTableColumns";
import CorrectBanner from "../CorrectBanner";

interface WarframedleGameProps {
  gameId: string;
}

export default function WarframedleGame({ gameId }: WarframedleGameProps) {
  const playerName = useStore($playerName);

  // ESTADO DEL JUEGO
  const {
    warframes,
    guessedNames,
    target,
    suggestions,
    attemptsLeft,
    gameMode,
    guesses,
    gameStatus,
    handleGuess,
    GameModeConfig,
  } = useWarframedle(warframeData as preWarframe[], gameId, playerName);

  const currentHeroWf =
    gameStatus === "playing"
      ? { name: "WARFRAMEDLE", wikiaThumbnail: undefined }
      : {
          name: target.name,
          imageURL: target.imageURL,
        };

  return (
    <RequirePlayer>
      <div className="flex flex-col items-center p-4 gap-6">
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

        {gameStatus === "playing" ? (
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
        ) : (
          <CorrectBanner
            imageURL={currentHeroWf.imageURL || ""}
            name={currentHeroWf.name}
          />
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
                          target={target}
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

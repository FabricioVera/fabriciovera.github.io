// DATA
import warframeData from "@data/Warframes_final.json";
import { $playerName } from "@store/playerStore";

// COMPONENTES
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import { useAutocomplete } from "@components/ui/Autocomplete/useAutocomplete";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";
import Pointer from "@components/ui/Pointer";
import { RequirePlayer } from "@auth/index";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";
import { abilitydleColumns } from "../../../config/gameTableColumns";

//HOOKS + UTILS
import { useStore } from "@nanostores/react";
import {
  getWikiThumbnail,
  getWarframeImageName,
  getWarframeThumbnailName,
} from "@utils/index";
import { abilityVisuals } from "@utils/ability";
import useWarframedleAbilities from "./hooks/useWarframedleAbilities";

// TYPES
import type { preWarframe, Warframe } from "src/types/warframe";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";
import CorrectBanner from "../CorrectBanner";

// CONFIG

interface AbilitydleProps {
  gameId: string;
}

export default function WarframedleAbilitiesGame({ gameId }: AbilitydleProps) {
  const playerName = useStore($playerName);

  // ESTADO DEL JUEGO
  const {
    warframes,
    warframeNames,
    target,
    attemptsLeft,
    gameMode,
    guesses,
    status,
    handleGuess,
    startDailyMode,
    startRandomMode,
  } = useWarframedleAbilities(
    warframeData as preWarframe[],
    gameId,
    playerName,
  );
  const guessedNames = guesses.map((g) => g.name);
  const suggestions = warframes
    .filter((wf) => !wf.isPrime && wf.name !== "Excalibur Umbra")
    .map((wf) => ({
      name: wf.name,
      imageURL: getWikiThumbnail(getWarframeThumbnailName(wf.name)),
    }));

  const GameModeConfig: GameModeCONF[] = [
    { gameModeName: "daily", gameModeHook: startDailyMode },
    { gameModeName: "random", gameModeHook: startRandomMode },
  ];

  const imageVisualStyles = abilityVisuals(
    target?.abilityName || "default",
    getWikiThumbnail(getWarframeImageName(target.abilityName + "130xWhite")),
    guesses.length,
    status,
  );

  return (
    <RequirePlayer>
      <div className="min-h-screen w-full max-w-[100vw] lg:max-w-5xl mx-auto p-4 flex flex-col lg:items-center gap-6 overflow-auto">
        {gameMode === "daily" && (
          <Pointer
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
        <div className="relative w-40 h-40 md:w-48 md:h-48 overflow-hidden rounded-xl bg-primary shadow-lg border border-secondary flex items-center justify-center">
          <div
            style={imageVisualStyles}
            className="w-full h-full flex items-center justify-center pointer-events-none"
          />
        </div>

        {status === "playing" ? (
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
            imageURL={getWikiThumbnail(
              getWarframeThumbnailName(target.warframeName),
            )}
            name={target.name}
          />
        )}

        <table className="w-fit mt-4 bg-primary text-white">
          <TableHeader columns={abilitydleColumns} />
          <tbody>
            {guesses.map((guess, index) => {
              const guessObj = warframes.find((w) => w.name === guess.name);
              const targetObj = warframes.find(
                (w) => w.name === target.warframeName,
              );
              if (!guessObj) return null;

              return (
                <tr key={index}>
                  {abilitydleColumns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex + "-" + col.header}
                      guess={guessObj}
                      target={
                        targetObj as unknown as Warframe
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
    </RequirePlayer>
  );
}

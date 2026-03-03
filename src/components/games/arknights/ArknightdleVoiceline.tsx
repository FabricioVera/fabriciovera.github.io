// REACT
import { useEffect, useMemo, useState } from "react";

// COMPONENTS
import Pointer from "@components/ui/Pointer";
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";

// TYPES
import type { OperatorDTO, Suggestion } from "src/types/index";

// HOOKS UTILS
import { useOperators } from "@hooks/useOperators";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";
import { useHandleGuess } from "@hooks/useHandleGuess";

// AUTH
import { $playerName } from "@store/playerStore";
import { RequirePlayer } from "@auth/index";
import { useStore } from "@nanostores/react";

// CONFIG
import { ArknightdleVoiceColumns } from "@config/gameTableColumns";
import type { GameModeCONF } from "../../ui/GameModeSelector/GameModeSelector";
import GameModeSelector from "../../ui/GameModeSelector/GameModeSelector";
import type { GameStatus } from "../../../types/game";
import CorrectBanner from "../CorrectBanner";
import { useGetTarget, useSuggestions } from "./hooks/useGameHelpers";

interface ArknightDLEProps {
  gameId: string;
}

export default function ArknightDLEVoiceline({ gameId }: ArknightDLEProps) {
  const playerName = useStore($playerName);
  const [gameStatus, setGameStatus] = useState<GameStatus>("loading");

  const [gameMode, setGameMode] = useState<string>("daily");
  const GameModeConfig: GameModeCONF[] = [
    {
      gameModeName: "daily",
      gameModeHook: () => {
        setGameMode("daily");
        setGameStatus("playing");
      },
    },
    {
      gameModeName: "random",
      gameModeHook: () => {
        setGameMode("random");
        setGameStatus("playing");
      },
    },
  ];

  const { operators } = useOperators(setGameStatus);
  const { target } = useGetTarget(operators, gameId, gameMode);
  const { suggestions } = useSuggestions(operators);

  const { guesses, handleGuess } = useHandleGuess(
    target,
    operators,
    playerName,
    gameId,
    gameMode,
    gameStatus,
    setGameStatus,
  );
  const guessedNames = guesses.map((g) => g.name);

  if (gameStatus === "loading") {
    return (
      <div className="w-full text-white text-2xl text-center">
        Cargando juego....
      </div>
    );
  }
  const randomNumber = Math.floor(Math.random() * (38 + 1))
    .toString()
    .padStart(2, "0");

  return (
    <RequirePlayer>
      <div className="flex flex-col items-center p-4 gap-6">
        <Pointer
          playerName={playerName}
          score={guesses.length}
          gameId={gameId}
          isDaily={true}
          ascending={true}
          pointsName="Intentos"
        />
        <GameModeSelector
          gameModeCONF={GameModeConfig}
          actualGameMode={gameMode}
        />
        {gameMode === "random" && (
          <button
            className="text-white text-2xl bg-primary border border-accent"
            onClick={() => setGameStatus("lost")}
          >
            Rendirse
          </button>
        )}
        {gameStatus === "playing" ? (
          <AutocompleteInput
            onGuess={handleGuess}
            guessedNames={guessedNames}
            suggestionList={suggestions || [{ name: "", imageURL: "" }]}
            placeholder="Amiya, Utage, Pozemka..."
          />
        ) : (
          <CorrectBanner imageURL={target.imageURL} name={target.name} />
        )}

        <audio
          controls
          src={`https://arknights.wiki.gg/images/${target.name}-0${randomNumber}.ogg?e26f78`}
        ></audio>

        <table className="w-fit mt-4 bg-primary text-white">
          <TableHeader columns={ArknightdleVoiceColumns} />
          <tbody>
            {guesses.map((guess, index) => {
              const guessObj = operators?.find(
                (operator) => operator.name === guess.name,
              );
              const targetObj = operators?.find(
                (operator) => operator.name === target.name,
              );
              if (!guessObj) return null;

              return (
                <tr key={index}>
                  {ArknightdleVoiceColumns.map((col, colIndex) => (
                    <TableCell
                      key={colIndex + "-" + col.header}
                      guess={guessObj}
                      target={targetObj as unknown as OperatorDTO}
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

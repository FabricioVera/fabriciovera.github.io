// REACT
import { useCallback, useEffect, useMemo, useState } from "react";

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
import { ArknightdleColumns } from "@config/gameTableColumns";
import type { GameModeCONF } from "../../ui/GameModeSelector/GameModeSelector";
import GameModeSelector from "../../ui/GameModeSelector/GameModeSelector";
import type { GameStatus } from "../../../types/game";
import CorrectBanner from "../CorrectBanner";

interface ArknightDLEProps {
  gameId: string;
}

function useGetTarget(
  operatorNames: any[] | undefined,
  gameId: string,
  gameMode: string | undefined,
) {
  const target = useMemo(() => {
    if (!operatorNames?.length) return undefined;
    if (gameMode === "daily") {
      return calculateDailyTarget(operatorNames, gameId);
    } else {
      return calculateRandomTarget(operatorNames);
    }
  }, [operatorNames, gameMode]);

  return { target };
}

function useSuggestions(operators: any[] | undefined) {
  const [suggestions, setSuggestions] = useState<
    { name: string; imageURL: string }[] | undefined
  >([{ name: "cargando ops....", imageURL: "" }]);
  useEffect(() => {
    setSuggestions(
      operators?.map((op) => ({ name: op.name, imageURL: op.imageURL })),
    );
  }, [operators]);
  return { suggestions };
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  const playerName = useStore($playerName);
  const [gameStatus, setGameStatus] = useState<GameStatus>("loading");

  const [gameMode, setGameMode] = useState<string>("daily");
  const GameModeConfig: GameModeCONF[] = [
    { gameModeName: "daily", gameModeHook: () => setGameMode("daily") },
    { gameModeName: "random", gameModeHook: () => setGameMode("random") },
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

  return (
    <RequirePlayer>
      <div className="min-h-screen w-full max-w-[100vw] lg:max-w-5xl mx-auto p-4 flex flex-col lg:items-center gap-6 overflow-auto">
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

        <table className="w-fit mt-4 bg-primary text-white">
          <TableHeader columns={ArknightdleColumns} />
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
                  {ArknightdleColumns.map((col, colIndex) => (
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

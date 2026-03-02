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
    if (gameMode === "random") return calculateRandomTarget(operatorNames);

    return calculateDailyTarget(operatorNames, gameId);
  }, [operatorNames, gameMode]);

  return { target };
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  const playerName = useStore($playerName);
  const { operators, getOperators } = useOperators();
  const [gameMode, setGameMode] = useState<string>("daily");
  const { target } = useGetTarget(operators, gameId, gameMode);
  const [suggestions, setSuggestions] = useState<
    { name: string; imageURL: string }[] | undefined
  >([{ name: "cargando ops....", imageURL: "" }]);

  const { guesses, handleGuess } = useHandleGuess(
    target,
    operators,
    playerName,
    gameId,
    "daily",
  );
  const guessedNames = guesses.map((g) => g.name);

  useEffect(() => {
    getOperators();
  }, []);

  useEffect(() => {
    setSuggestions(
      operators?.map((op) => ({ name: op.name, imageURL: op.iconURL })),
    );
  }, [operators]);

  const GameModeConfig: GameModeCONF[] = [
    { gameModeName: "daily", gameModeHook: () => setGameMode("daily") },
    { gameModeName: "random", gameModeHook: () => setGameMode("random") },
  ];

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
        <AutocompleteInput
          onGuess={handleGuess}
          guessedNames={guessedNames}
          suggestionList={suggestions || [{ name: "", imageURL: "" }]}
          placeholder="Amiya, Utage, Pozemka..."
        />
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

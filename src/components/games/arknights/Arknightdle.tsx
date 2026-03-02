import { RequirePlayer } from "@auth/index";
import { useEffect, useMemo, useState } from "react";
import { useOperators } from "@hooks/useOperators";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";
import Pointer from "@components/ui/Pointer";
import { $playerName } from "@store/playerStore";
import { useStore } from "@nanostores/react";
import AutocompleteInput from "../../ui/Autocomplete/AutocompleteInput";
import { useHandleGuess } from "@hooks/useHandleGuess";
import type { OperatorDTO, Suggestion } from "../../../types";
import TableHeader from "../../ui/GuessedTable/TableHeader";
import { ArknightdleColumns } from "../../../config/gameTableColumns";
import TableCell from "../../ui/GuessedTable/TableCell";

interface ArknightDLEProps {
  gameId: string;
}

function useGetTarget(operatorNames: any[] | undefined, gameId: string) {
  const target = useMemo(() => {
    if (!operatorNames?.length) return undefined;
    return calculateDailyTarget(operatorNames, gameId);
  }, [operatorNames]);

  return { target };
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  const playerName = useStore($playerName);
  const { operators, getOperators } = useOperators();
  const { target } = useGetTarget(operators, gameId);
  const [suggestions, setSuggestions] = useState<
    { name: string; imageURL: string }[] | undefined
  >();

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

import React from "react";
import TableHeader from "./TableHeader";
import TableCell from "./TableCell";
import type { OperatorDTO, ColumnDef } from "src/types/index";

interface EnrichedGuess {
  guessObj: OperatorDTO;
  targetObj: OperatorDTO;
}

interface GuessesTableProps {
  guesses: EnrichedGuess[];
  columns: ColumnDef<OperatorDTO>[];
}

export default function GuessesTable({ guesses, columns }: GuessesTableProps) {
  if (guesses.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto flex justify-start lg:justify-center mt-4">
      <table className="min-w-max table-auto mb-40 bg-primary text-neutral-primary shadow-md rounded-lg overflow-hidden">
        <TableHeader columns={columns} />
        <tbody>
          {guesses.map((enrichedGuess, index) => (
            <tr
              key={index}
              className="border-b border-secondary/50 hover:bg-secondary/20 transition-colors"
            >
              {columns.map((col, colIndex) => (
                <TableCell
                  key={`${colIndex}-${col.header}`}
                  guess={enrichedGuess.guessObj}
                  target={enrichedGuess.targetObj}
                  columnDef={col}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

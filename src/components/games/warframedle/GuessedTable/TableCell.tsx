import type { Warframe } from "src/types/warframe";

interface TableCellProps {
  guess: Warframe;
  dailyWarframe: Warframe;
  columnCONF: {
    key: keyof Warframe;
    displayType: "boolean" | "image" | "higher/lower" | "partial" | "equal";
  };
}

export default function TableCell({
  guess,
  dailyWarframe,
  columnCONF,
}: TableCellProps) {
  const guessValue = guess[columnCONF.key] as any;
  const dailyValue = dailyWarframe[columnCONF.key] as any;
  const match = "bg-success";
  const notMatch = "bg-error";
  const partialMatch = "bg-warning";

  const getCellClass = () => {
    switch (columnCONF.displayType) {
      case "image":
        return "flex justify-center items-center";
      case "boolean":
        if (guessValue === dailyValue) {
          return match;
        } else {
          return notMatch;
        }
      case "higher/lower":
        if (dailyValue > guessValue || dailyValue < guessValue) return notMatch;
        if (dailyValue === guessValue) return match;
      case "partial":
        if (!Array.isArray(guessValue))
          return guessValue + "(no está bien configurado esta variable)";
        if (dailyValue === guessValue) return match;
        else if (guessValue.some((value) => dailyValue.includes(value)))
          return partialMatch;
        else return notMatch;
      case "equal":
        if (guessValue === dailyValue) {
          return match;
        } else {
          return notMatch;
        }
    }
  };

  const renderCell = () => {
    switch (columnCONF.displayType) {
      case "image":
        return (
          <div className="flex justify-center items-center">
            <img
              src={guess.wikiaThumbnail}
              alt=""
              className="w-24 h-24 rounded-full"
            />
          </div>
        );
      case "boolean":
        return guessValue ? "Sí" : "No";
      case "partial":
        if (!Array.isArray(guessValue))
          return guessValue + "(no está bien configurado esta variable)";
        if (dailyValue === guessValue) return guessValue.join(", ");
        else if (guessValue.some((value) => dailyValue.includes(value)))
          return guessValue.join(", ");
        else return guessValue.join(", ");
      case "higher/lower":
        if (dailyValue > guessValue) return guessValue + " ⬆️";
        else if (dailyValue < guessValue) return guessValue + " ⬇️";
        else return guessValue;
      default:
        return guessValue;
    }
  };

  return (
    <td className={`px-1 lg:px-4 lg:p-2 ${getCellClass()}`}>{renderCell()}</td>
  );
}

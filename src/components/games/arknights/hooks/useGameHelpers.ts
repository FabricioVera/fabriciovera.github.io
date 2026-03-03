import { useEffect, useMemo, useState } from "react";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";

export function useGetTarget(
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

export function useSuggestions(operators: any[] | undefined) {
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

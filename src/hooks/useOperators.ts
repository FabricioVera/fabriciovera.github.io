import { useCallback, useEffect, useState } from "react";
import { fetchOperators } from "@lib/arknights";
import { logger } from "@services/logger";
import type { OperatorDTO } from "../types";
import type { GameStatus } from "../types/game";

export function useOperators(setGameStatus: (gameStatus: GameStatus) => void) {
  const [operators, setOperators] = useState<OperatorDTO[]>();

  const getOperators = useCallback(async () => {
    const newoperators = await fetchOperators();
    logger.info("Se obtuvieron los operadores");
    setOperators(newoperators);
    setGameStatus("playing");
  }, []);

  useEffect(() => {
    getOperators();
  }, []);

  return { operators };
}

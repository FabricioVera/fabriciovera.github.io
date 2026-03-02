import { useCallback, useState } from "react";
import { fetchOperators } from "@lib/arknights";
import { logger } from "@services/logger";
import type { OperatorDTO } from "../types";

export function useOperators() {
  const [operators, setOperators] = useState<OperatorDTO[]>();

  const getOperators = useCallback(async () => {
    const newoperators = await fetchOperators();
    setOperators(newoperators);
    logger.info("Operadores obtenidos: ", newoperators);
  }, []);

  return { operators, getOperators };
}

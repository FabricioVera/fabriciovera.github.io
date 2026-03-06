import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateDailyTarget,
  calculateRandomTarget,
  calculateRandomTargetArknights,
} from "@utils/game";
import type { BaseGameEntity } from "src/types/game";

export function useGetTarget<T extends BaseGameEntity>(
  gameId: string,
  gameMode?: string | undefined,
  items?: T[],
) {
  const [target, setTarget] = useState<T | undefined>(undefined);

  const refreshTarget = useCallback(() => {
    if (!items?.length) return;
    if (gameMode === "daily") {
      setTarget(calculateDailyTarget(items, gameId));
    } else {
      if (gameId === "arknightdle" || gameId === "arknightdlevoiceline") {
        setTarget(calculateRandomTargetArknights(items));
      } else {
        setTarget(calculateRandomTarget(items));
      }
    }
  }, [items, gameMode]);

  useEffect(() => {
    refreshTarget();
  }, [items, gameMode, gameId]);

  return { target, refreshTarget };
}

export function useSuggestions<T extends BaseGameEntity>(items?: T[]) {
  const [suggestions, setSuggestions] = useState<
    BaseGameEntity[] | undefined
  >();
  useEffect(() => {
    setSuggestions(
      items?.map((item) => ({ name: item.name, imageURL: item.imageURL })),
    );
  }, [items]);
  return { suggestions };
}

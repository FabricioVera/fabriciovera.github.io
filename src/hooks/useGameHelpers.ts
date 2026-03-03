import { useEffect, useMemo, useState } from "react";
import { calculateDailyTarget, calculateRandomTarget } from "@utils/game";
import type { BaseGameEntity } from "src/types/game";

export function useGetTarget<T extends BaseGameEntity>(
  gameId: string,
  gameMode?: string | undefined,
  items?: T[],
) {
  const target = useMemo(() => {
    if (!items?.length) return;
    if (gameMode === "daily") {
      return calculateDailyTarget(items, gameId);
    } else {
      return calculateRandomTarget(items);
    }
  }, [items, gameMode]);

  return { target };
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

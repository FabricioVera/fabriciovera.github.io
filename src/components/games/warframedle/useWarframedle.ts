import { useEffect, useMemo, useState } from "react";
import type { Warframe, ParsedWarframe } from "src/types/warframe";
import type { GameStatus } from "src/types/game";

export default function useWarframedle(rawData: Warframe[]) {
  const warframes: ParsedWarframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);

  const dailyWarframe = useMemo(() => {
    const today = new Date();
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate();
    const index = seed % warframes.length;
    return warframes[index];
  }, [warframes]);

  const [guesses, setGuesses] = useState<ParsedWarframe[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [selectedWarframe, setSelectedWarframe] = useState<string>("");

  const handleGuess = (warframeName: string) => {
    setSelectedWarframe(warframeName);
    if (status === "won") return;

    const guessedWf = warframes.find((w) => w.name === warframeName);
    if (!guessedWf) return;

    if (guesses.some((g) => g.name === guessedWf.name)) return;

    setGuesses((prev) => [guessedWf, ...prev]);

    if (guessedWf.name === dailyWarframe.name) {
      setStatus("won");
    }
  };

  const warframeNames = useMemo(() => {
    return warframes
      .filter((wf) => !guesses.some((g) => g.name === wf.name))
      .map((wf) => ({
        name: wf.name,
        wikiaThumbnail: wf.wikiaThumbnail,
      }));
  }, [warframes, guesses]);

  return {
    warframes,
    warframeNames,
    dailyWarframe,
    guesses,
    status,
    handleGuess,
    selectedWarframe,
  };
}

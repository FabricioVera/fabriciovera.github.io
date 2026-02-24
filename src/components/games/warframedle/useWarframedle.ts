import { useCallback, useEffect, useMemo, useState } from "react";
import type { preWarframe, Warframe } from "src/types/warframe";
import type { GameStatus } from "src/types/game";
import { saveHighScore } from "src/services/scoreRepository";
import Rand from "rand-seed";

export type GameMode = "daily" | "random";

const MAX_DAILY_ATTEMPTS = 100;
const DAILY_STORAGE_KEY = "warframedle_daily_state";

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export default function useWarframedle(
  rawData: preWarframe[],
  gameId: string,
  playerName: string | null,
) {
  const [gameMode, setGameMode] = useState<GameMode>("daily");
  const [guesses, setGuesses] = useState<Warframe[]>([]);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [selectedWarframe, setSelectedWarframe] = useState<string>("");
  const [randomWarframe, setRandomWarframe] = useState<Warframe | null>(null);

  const warframes: Warframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);

  const loadDailyProgress = useCallback(() => {
    const savedState = localStorage.getItem(DAILY_STORAGE_KEY);
    const todayStr = getTodayDateString();

    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.date === todayStr) {
        const rehydratedGuesses = parsed.guesses
          .map((name: string) => warframes.find((w) => w.name === name))
          .filter(Boolean) as Warframe[];

        setGuesses(rehydratedGuesses);
        setStatus(parsed.status);
        return;
      }
    }

    setGuesses([]);
    setStatus("playing");
  }, [warframes]);

  useEffect(() => {
    loadDailyProgress();
  }, [loadDailyProgress]);

  useEffect(() => {
    if (gameMode === "daily") {
      const stateToSave = {
        date: getTodayDateString(),
        guesses: guesses.map((g) => g.name),
        status: status,
      };
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [guesses, status, gameMode]);

  const dailyTarget = useMemo(() => {
    const today = new Date();
    const seed = (
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate()
    ).toString();

    const rand = new Rand(seed);
    const randomValue = rand.next();

    return warframes[Math.floor(randomValue * (warframes.length - 0 + 1))];
  }, [warframes]);

  const startDailyMode = useCallback(() => {
    setGameMode("daily");
    loadDailyProgress();
  }, []);

  const startRandomMode = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * warframes.length);
    setRandomWarframe(warframes[randomIndex]);
    setGameMode("random");
    setGuesses([]);
    setStatus("playing");
  }, []);

  const targetWarframe =
    gameMode === "daily" ? dailyTarget : randomWarframe || dailyTarget;

  const handleGuess = (warframeName: string) => {
    setSelectedWarframe(warframeName);
    if (status !== "playing") return;

    const guessedWf = warframes.find((w) => w.name === warframeName);
    if (!guessedWf || guesses.some((g) => g.name === guessedWf.name)) return;

    setGuesses((prev) => [guessedWf, ...prev]);

    if (guessedWf.name === targetWarframe.name) {
      setStatus("won");
      if (!playerName) return;
      saveHighScore(gameId, playerName, MAX_DAILY_ATTEMPTS - guesses.length);
    } else if (gameMode === "daily" && guesses.length > MAX_DAILY_ATTEMPTS) {
      setStatus("lost");
    }
  };

  const warframeNames = useMemo(() => {
    return warframes
      .filter((wf) => !guesses.some((g) => g.name === wf.name))
      .map((wf) => ({
        name: wf.name,
      }));
  }, [warframes, guesses]);

  return {
    warframes,
    warframeNames,
    targetWarframe,
    gameMode,
    attemptsLeft:
      gameMode === "daily" ? MAX_DAILY_ATTEMPTS - guesses.length : null,
    guesses,
    status,
    selectedWarframe,
    handleGuess,
    startDailyMode,
    startRandomMode,
  };
}

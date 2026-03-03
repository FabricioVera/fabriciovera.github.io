// REACT
import { useCallback, useEffect, useRef, useState } from "react";

// COMPONENTS
import Pointer from "@components/ui/Pointer";
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";

// TYPES
import type { OperatorDTO } from "src/types/index";

// HOOKS UTILS
import { useOperators } from "@hooks/useOperators";
import { useHandleGuess } from "@hooks/useHandleGuess";

// AUTH
import { $playerName } from "@store/playerStore";
import { RequirePlayer } from "@auth/index";
import { useStore } from "@nanostores/react";

// CONFIG
import { ArknightdleColumns } from "@config/gameTableColumns";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";
import type { GameStatus } from "src/types/game";
import CorrectBanner from "../CorrectBanner";
import { useGetTarget, useSuggestions } from "./hooks/useGameHelpers";
import {
  loadDailyProgress,
  saveDailyProgress,
} from "@services/dailyStorageRepository";
import { logger } from "@services/logger";
import { useGameModeStorage } from "@hooks/useGameModeStorage";

interface ArknightDLEProps {
  gameId: string;
}

//* LOCAL STORAGE DAILY MANAGEMENT
function useDailyStorage({
  gameId,
  operators,
}: {
  gameId: string;
  operators: OperatorDTO[] | undefined;
}) {
  /**
   * Carga intentos desde BD.
   * @returns Estado guardado.
   */
  const loadProgress = useCallback(() => {
    if (!operators) return null;
    const savedState = loadDailyProgress(gameId);
    if (!savedState) return null;

    const guesses = savedState.guesses
      .map((name: string) => operators.find((op) => op.name === name))
      .filter(Boolean) as OperatorDTO[];

    return { guesses, status: savedState.status };
  }, [gameId, operators]);

  /**
   * Guarda progreso en BD.
   * @param guesses Intentos.
   */
  const saveProgress = useCallback(
    (guesses: OperatorDTO[], status: GameStatus) => {
      saveDailyProgress(gameId, guesses, status);
    },
    [gameId],
  );

  return { loadProgress, saveProgress };
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  // ESTADOS GLOBALES
  const playerName = useStore($playerName);
  const [gameStatus, setGameStatus] = useState<GameStatus>("loading");
  const { gameMode, setGameModeValue } = useGameModeStorage({ gameId });

  const isHydrating = useRef(true);

  // CUSTOM HOOKS
  const { operators } = useOperators(setGameStatus);
  const { target } = useGetTarget(operators, gameId, gameMode);
  const { suggestions } = useSuggestions(operators);

  const { loadProgress, saveProgress } = useDailyStorage({ gameId, operators });

  //* ------------- HANDLE GUESS HOOK --------------------
  const { guesses, setGuesses, handleGuess } = useHandleGuess(
    target,
    operators,
    playerName,
    gameId,
    gameMode,
    gameStatus,
    setGameStatus,
  );

  // * ------------- Callbacks -----------
  /**
   * Activa modo diario y lo inicializa.
   */
  const startDailyMode = useCallback(() => {
    setGameModeValue("daily");
    isHydrating.current = true;
    try {
      const saved = loadProgress();
      if (saved) {
        setGuesses(saved.guesses);
        setGameStatus(saved.status);
      } else {
        setGuesses([]);
        setGameStatus("playing");
      }
    } catch (error) {
      logger.error(`Error de inicialización`, error);
      setGuesses([]);
      setGameStatus("playing");
    } finally {
      // Liberamos el bloqueo en el siguiente ciclo de render
      setTimeout(() => {
        isHydrating.current = false;
      }, 0);
    }
  }, [loadProgress, setGuesses]);

  /**
   * Activa modo aleatorio y limpia intentos.
   */
  const startRandomMode = useCallback(() => {
    setGameModeValue("random");
    setGuesses([]);
    setGameStatus("playing");
  }, []);

  // * --------- Effects ---------
  useEffect(() => {
    if (operators && gameMode === "daily") {
      startDailyMode();
    }
  }, [startDailyMode, operators]);

  useEffect(() => {
    if (
      gameMode === "daily" &&
      gameStatus !== "loading" &&
      !isHydrating.current
    ) {
      saveProgress(guesses, gameStatus);
    }
  }, [guesses, gameStatus, gameMode, saveProgress]);

  // * Variables y configuraciones derivadas
  const GameModeConfig: GameModeCONF[] = [
    {
      gameModeName: "daily",
      gameModeHook: startDailyMode,
    },
    {
      gameModeName: "random",
      gameModeHook: startRandomMode,
    },
  ];

  const guessedNames = guesses.map((g) => g.name);

  if (gameStatus === "loading") {
    return (
      <div className="w-full text-white text-2xl text-center">
        Cargando juego....
      </div>
    );
  }

  return (
    <RequirePlayer>
      <div className="flex flex-col items-center p-4 gap-6">
        <Pointer
          playerName={playerName}
          score={guesses.length}
          gameId={gameId}
          isDaily={true}
          ascending={true}
          pointsName="Intentos"
        />
        <GameModeSelector
          gameModeCONF={GameModeConfig}
          actualGameMode={gameMode}
        />
        {gameMode === "random" && (
          <button
            className="text-white text-2xl bg-primary border border-accent"
            onClick={() => setGameStatus("lost")}
          >
            Rendirse
          </button>
        )}
        {gameStatus === "playing" ? (
          <AutocompleteInput
            onGuess={handleGuess}
            guessedNames={guessedNames}
            suggestionList={suggestions || [{ name: "", imageURL: "" }]}
            placeholder="Amiya, Utage, Pozemka..."
          />
        ) : (
          <CorrectBanner imageURL={target.imageURL} name={target.name} />
        )}
        {guesses.length > 0 && (
          <div className="w-full overflow-x-auto flex justify-start lg:justify-center ">
            <table className="min-w-max table-auto mt-4 bg-primary text-white">
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
        )}
      </div>
    </RequirePlayer>
  );
}

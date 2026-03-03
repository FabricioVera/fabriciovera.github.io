// REACT
import { useCallback, useEffect, useState } from "react";

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
} from "../../../services/dailyStorageRepository";
import { logger } from "../../../services/logger";

interface ArknightDLEProps {
  gameId: string;
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  // ESTADOS GLOBALES
  const playerName = useStore($playerName);
  const [gameStatus, setGameStatus] = useState<GameStatus>("loading");
  const [gameMode, setGameMode] = useState<string>("daily");

  // CUSTOM HOOKS
  const { operators } = useOperators(setGameStatus);
  const { target } = useGetTarget(operators, gameId, gameMode);
  const { suggestions } = useSuggestions(operators);

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
   * Inicializa modo diario y carga estado.
   */
  const initializeDailyMode = useCallback(() => {
    try {
      const savedState = loadDailyProgress(gameId);

      if (savedState) {
        const rehydratedGuesses = savedState.guesses
          .map((name: string) => operators?.find((op) => op.name === name))
          .filter(Boolean) as OperatorDTO[];

        logger.info(`Estado diario cargado exitosamente para ${gameId}`, {
          intentos: rehydratedGuesses.length,
          status: savedState.status,
        });

        setGuesses(rehydratedGuesses);
        setGameStatus(savedState.status);
      } else {
        setGuesses([]);
        setGameStatus("playing");
      }
    } catch (error) {
      logger.error(`Error al inicializar el modo diario en ${gameId}`, error);
      setGuesses([]);
      setGameStatus("playing");
    }
  }, [gameId, operators, setGuesses]);

  /**
   * Activa modo diario y lo inicializa.
   */
  const startDailyMode = useCallback(() => {
    setGameMode("daily");
    initializeDailyMode();
  }, [initializeDailyMode]);

  /**
   * Activa modo aleatorio y limpia intentos.
   */
  const startRandomMode = useCallback(() => {
    setGameMode("random");
    setGuesses([]);
    setGameStatus("playing");
  }, []);

  // * --------- Effects ---------
  useEffect(() => {
    if (gameMode === "daily") {
      saveDailyProgress(gameId, guesses, gameStatus);
    }
  }, [gameId, guesses, gameStatus, gameMode]);

  useEffect(() => {
    if (operators) {
      initializeDailyMode();
    }
  }, [initializeDailyMode, operators]);

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
          <div className="w-full overflow-x-auto flex justify-center">
            <table className="w-fit mt-4 bg-primary text-white">
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

// REACT
import { useCallback, useEffect, useRef, useState } from "react";

// COMPONENTS
import Pointer from "@components/ui/Pointer";
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";
import CorrectBanner from "../CorrectBanner";
import { DiceRollerButton } from "@components/ui/General/DiceRoller";

// TYPES
import type { OperatorDTO } from "src/types/index";

// HOOKS UTILS
import { useOperators } from "@hooks/useOperators";
import { useHandleGuess } from "@hooks/useHandleGuess";
import { useGetTarget, useSuggestions } from "../../../hooks/useGameHelpers";
import { useGameModeStorage } from "@hooks/useGameModeStorage";
import { useDailyStorage } from "@hooks/useDailyStorage";

// AUTH
import { $playerName } from "@store/playerStore";
import { RequirePlayer } from "@auth/index";
import { useStore } from "@nanostores/react";

// CONFIG
import { ArknightdleColumns } from "@config/gameTableColumns";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";
import type { GameStatus } from "src/types/game";
import { logger } from "@services/logger";
import { CalendarIcon, FlagIcon, InfinityIcon } from "../../Icons";
import Button from "../../ui/General/Button";
import { useAutocomplete } from "../../ui/Autocomplete/useAutocomplete";

interface ArknightDLEProps {
  gameId: string;
}

function useGameState() {
  const [gameState, setGameState] = useState<GameStatus>("loading");

  const setGameStatus = (newGameState: GameStatus) => {
    setGameState(newGameState);
    logger.info("El estado del juego cambió a", gameState);
  };

  return { gameState, setGameStatus };
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  //* ESTADOS GLOBALES
  const playerName = useStore($playerName);
  const { gameState: gameStatus, setGameStatus } = useGameState();
  const { gameMode, setGameModeValue } = useGameModeStorage({ gameId });

  const isHydrating = useRef(true);

  //* CUSTOM HOOKS
  const { operators } = useOperators(setGameStatus);
  const { target, refreshTarget } = useGetTarget<OperatorDTO>(
    gameId,
    gameMode,
    operators,
  );
  const { suggestions } = useSuggestions<OperatorDTO>(operators);

  const { loadProgress, saveProgress } = useDailyStorage<OperatorDTO>({
    gameId,
    items: operators,
  });

  //* ------------- HANDLE GUESS HOOK --------------------
  const { guesses, setGuesses, clearGuesses, handleGuess } = useHandleGuess(
    target,
    operators,
    playerName,
    gameId,
    gameMode,
    gameStatus,
    setGameStatus,
  );

  // * ------------- Callbacks -----------
  const handleRandomReroll = useCallback(() => {
    if (gameMode !== "random") return;
    refreshTarget();
    clearGuesses();
    setGameStatus("playing");
  }, [gameMode, refreshTarget, clearGuesses, setGameStatus]);
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
        clearGuesses();
        setGameStatus("playing");
      }
    } catch (error) {
      logger.error(`Error de inicialización`, error);
      clearGuesses();
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
    clearGuesses();
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
      gameModeLabel: (
        <div title="Modo Diario">
          <CalendarIcon />
        </div>
      ),
      gameModeName: "daily",
      gameModeHook: startDailyMode,
    },
    {
      gameModeLabel: (
        <div title="Modo Infinito">
          <InfinityIcon />
        </div>
      ),
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

  if (target === undefined) {
    return (
      <div className="w-full text-white text-2xl text-center">
        Cargando objetivo....
      </div>
    );
  }

  // * INICIO DEL RETURN ----------------
  return (
    <RequirePlayer>
      <div className="flex flex-col items-center p-2 gap-1">
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
        <div className="flex flex-row items-end gap-2 w-full max-w-lg">
          {gameMode !== "daily" && (
            <div className="w-12">
              <Button
                title="Rendirse FF :("
                aria-label="Rendirse FF :("
                onClick={() => setGameStatus("lost")}
                className="rounded-xl transition-all flex flex-col items-center shadow-lg outline-none p-1"
              >
                <FlagIcon size="100%" />
              </Button>
            </div>
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
          {gameMode !== "daily" && (
            <>
              <div className="w-12">
                <DiceRollerButton onRoll={handleRandomReroll} />
              </div>
            </>
          )}
        </div>
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

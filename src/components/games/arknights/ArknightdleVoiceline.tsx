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
import {
  ArknightdleVoiceColumns,
  ArknightdleVoiceColumnsSprites,
} from "@config/gameTableColumns";
import type { GameModeCONF } from "../../ui/GameModeSelector/GameModeSelector";
import GameModeSelector from "../../ui/GameModeSelector/GameModeSelector";
import type { GameStatus } from "../../../types/game";
import CorrectBanner from "../CorrectBanner";
import { useGetTarget, useSuggestions } from "../../../hooks/useGameHelpers";
import { logger } from "@services/logger";
import Button from "../../ui/General/Button";
import { CalendarIcon, FlagIcon, InfinityIcon } from "../../Icons";
import { useGameModeStorage } from "@hooks/useGameModeStorage";
import { useDailyStorage } from "@hooks/useDailyStorage";
import { DiceRollerButton } from "../../ui/General/DiceRoller";
import MultiVoicePlayer from "../../ui/Player/VoicePlayer";

interface ArknightDLEProps {
  gameId: string;
}

export default function ArknightDLEVoiceline({ gameId }: ArknightDLEProps) {
  const playerName = useStore($playerName);
  const [gameStatus, setGameStatus] = useState<GameStatus>("loading");
  const { gameMode, setGameModeValue } = useGameModeStorage({ gameId });

  const isHydrating = useRef(true);

  const savedSprites = localStorage.getItem(`${gameId}-Sprites-`);
  const [sprites, setSprites] = useState<boolean>(
    savedSprites ? JSON.parse(savedSprites) : false,
  );
  const spritesStatus = (e: any) => {
    setSprites(e.target.checked);
    localStorage.setItem(`${gameId}-Sprites-`, e.target.checked);
  };
  const Columns = sprites
    ? ArknightdleVoiceColumnsSprites
    : ArknightdleVoiceColumns;

  const { operators } = useOperators(setGameStatus);
  const { target, refreshTarget } = useGetTarget(gameId, gameMode, operators);
  const { suggestions } = useSuggestions(operators);

  const { loadProgress, saveProgress } = useDailyStorage<OperatorDTO>({
    gameId,
    items: operators,
  });

  const { guesses, setGuesses, handleGuess, clearGuesses } = useHandleGuess(
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
    if (
      gameMode === "daily" &&
      gameStatus !== "loading" &&
      !isHydrating.current
    ) {
      saveProgress(guesses, gameStatus);
    }
  }, [guesses, gameStatus, gameMode, saveProgress]);

  useEffect(() => {
    if (operators && gameMode === "daily") {
      startDailyMode();
    }
  }, [startDailyMode, operators]);

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
            <div className="w-12">
              <DiceRollerButton onRoll={handleRandomReroll} />
            </div>
          )}
        </div>

        <MultiVoicePlayer
          targetName={target.name}
          guessesCount={guesses.length}
        />

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={sprites}
            onChange={spritesStatus}
            aria-label="Alternar estado de sprites"
          />
          <div
            className="w-11 h-6 bg-primary rounded-full peer-checked:after:translate-x-full border border-secondary
          peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 
          after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"
          ></div>
          <span className="ml-3 text-sm font-medium text-white">
            Sprites {sprites ? "Activados" : "Desactivados"}
          </span>
        </label>
        <table className="w-fit mt-4 bg-primary text-white">
          <TableHeader columns={Columns} />
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
                  {Columns.map((col, colIndex) => (
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
    </RequirePlayer>
  );
}

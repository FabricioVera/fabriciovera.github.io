// REACT
import { useEffect, useMemo, useState } from "react";

// COMPONENTS
import Pointer from "@components/ui/Pointer";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";
import CorrectBanner from "../CorrectBanner";
import { DiceRollerButton } from "@components/ui/General/DiceRoller";
import ToggleSwitch from "../../ui/General/ToggleSwitch";

// TYPES
import type { OperatorDTO } from "src/types/index";

// AUTH
import { $playerName } from "@store/playerStore";
import { RequirePlayer } from "@auth/index";
import { useStore } from "@nanostores/react";

// CONFIG
import {
  ArknightdleColumns,
  ArknightdleColumnsSprites,
} from "@config/gameTableColumns";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";
import { CalendarIcon, FlagIcon, InfinityIcon } from "../../Icons";
import Button from "../../ui/General/Button";
import GuessesTable from "../../ui/GuessedTable/GuessesTable";
import AutocompleteInputStore from "./ArknightsStore/AutocompleteInputStore";
import HeroInput from "../../ui/InputHero";
import { useArknightStore } from "./ArknightsStore/useArknightStore";

interface ArknightDLEProps {
  gameId: string;
}

export default function ArknightDLE({ gameId }: ArknightDLEProps) {
  //* ESTADOS GLOBALES
  const playerName = useStore($playerName);

  const {
    gameStatus,
    gameMode,
    errorMessage,
    target,
    guesses,
    items,
    selectDirection,
    init,
    setGameMode,
    reroll,
    surrender,
    getSelectedSuggestion,
  } = useArknightStore();

  const currentSelection = getSelectedSuggestion();

  const savedSprites = localStorage.getItem(`${gameId}-Sprites-`);
  const [sprites, setSprites] = useState<boolean>(
    savedSprites ? JSON.parse(savedSprites) : false,
  );
  const spritesStatus = (e: any) => {
    setSprites(e.target.checked);
    localStorage.setItem(`${gameId}-Sprites-`, e.target.checked);
  };
  const Columns = sprites ? ArknightdleColumnsSprites : ArknightdleColumns;

  useEffect(() => {
    init(gameId, playerName);
  }, [gameId, playerName, init]);

  // * Variables y configuraciones derivadas
  const GameModeConfig: GameModeCONF[] = [
    {
      gameModeLabel: (
        <div title="Modo Diario">
          <CalendarIcon />
        </div>
      ),
      gameModeName: "daily",
      gameModeHook: () => setGameMode("daily"),
    },
    {
      gameModeLabel: (
        <div title="Modo Infinito">
          <InfinityIcon />
        </div>
      ),
      gameModeName: "random",
      gameModeHook: () => setGameMode("random"),
    },
  ];

  const guessedNames = guesses.map((g) => g.name);
  const operatorMap = useMemo(() => {
    if (!items) return new Map<string, OperatorDTO>();
    return new Map(items.map((op) => [op.name, op]));
  }, [items]);

  // 2. Pre-calculamos los datos que la tabla necesita renderizar
  const enrichedGuesses = useMemo(() => {
    if (!items || guesses.length === 0 || !target) return [];

    const targetObj = operatorMap.get(target.name);
    if (!targetObj) return [];

    return guesses
      .map((guess) => {
        const guessObj = operatorMap.get(guess.name);
        if (!guessObj) return null;
        return { guessObj, targetObj };
      })
      .filter(Boolean) as { guessObj: OperatorDTO; targetObj: OperatorDTO }[];
  }, [guesses, operatorMap, target?.name]);

  if (gameStatus === "loading" || !target) {
    return (
      <div className="w-full text-white text-2xl text-center">
        Cargando juego....
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
        <div className="block gap-2 justify-center mb-2">
          {currentSelection && gameStatus === "playing" ? (
            <HeroInput
              className="mask-b-from-70"
              key={currentSelection.name}
              itemName={currentSelection.name}
              thumbnailUrl={currentSelection.imageURL}
              selectDirection={selectDirection}
              isDefault={false}
            />
          ) : (
            <div className="h-[25vh] md:h-[35vh]"></div>
          )}
          {gameStatus !== "playing" && (
            <CorrectBanner imageURL={target.imageURL} name={target.name} />
          )}
        </div>
        <div className="flex flex-row items-center gap-2 w-full max-w-lg h-lh">
          {gameMode !== "daily" && (
            <div className="w-12">
              <Button
                title="Rendirse FF :("
                aria-label="Rendirse FF :("
                onClick={surrender}
                className="rounded-xl transition-all flex flex-col items-center shadow-lg outline-none p-1"
              >
                <FlagIcon size="100%" />
              </Button>
            </div>
          )}
          {gameStatus === "playing" && (
            <AutocompleteInputStore placeholder="Amiya, Utage, Pozemka..." />
          )}
          {gameMode !== "daily" && (
            <div className="w-12">
              <DiceRollerButton onRoll={reroll} />
            </div>
          )}
        </div>

        <ToggleSwitch
          label="Sprites"
          checked={sprites}
          onChange={spritesStatus}
        />

        <GuessesTable guesses={enrichedGuesses} columns={Columns} />
      </div>
    </RequirePlayer>
  );
}

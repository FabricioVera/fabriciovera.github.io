// REACT
import { useEffect, useMemo, useState } from "react";

// COMPONENTS
import Pointer from "@components/ui/Pointer";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";
import { DiceRollerButton } from "@components/ui/General/DiceRoller";
import ToggleSwitch from "@components/ui/General/ToggleSwitch";
import { ArknightsMascot } from "../../ui/Mascot/ArknightsMascot";

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
import ArknightsHeroInput from "./specificComponents/ArknightsInputHero";
import { useArknightStore } from "./ArknightsStore/useArknightStore";
import { gamesArknightdle } from "../../../data/games";
import { LevelPath } from "./specificComponents/ArknightsLevelPath";
import { ArknightsCorrectBanner } from "./specificComponents/ArknightsCorrectBanner";
import { getWikiImageURL } from "../../../utils";
import { loadDailyProgress } from "../../../services/dailyStorageRepository";
import { useFeatureFlag } from "../../../store/featureFlagsStore";

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
    init,
    setGameMode,
    reroll,
    surrender,
  } = useArknightStore();

  const { flags } = useFeatureFlag();

  const Columns = flags.showSprites
    ? ArknightdleColumnsSprites
    : ArknightdleColumns;

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

  const gamesLinked = gamesArknightdle.map((game) => {
    const savedStatus = loadDailyProgress(game.id);
    const status = savedStatus?.status || "playing";
    return {
      id: game.id,
      name: game.name,
      completed: status !== "playing",
      active: gameId === game.id,
      url: game.url,
      title: game.title,
    };
  });
  const stars =
    gameStatus === "lost"
      ? 0
      : guesses.length < 5
        ? 3
        : guesses.length < 10
          ? 2
          : 1;

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
      {flags.showMascot && (
        <ArknightsMascot imageURL={`/img/${gameId}-mascot.webp`} />
      )}
      <div className="flex flex-col items-center p-2 gap-1">
        <section className="flex flex-col w-full max-w-lg gap-2 bg-primary/80 rounded-2xl border border-secondary/30">
          <Pointer
            className="text-white"
            playerName={playerName}
            score={guesses.length}
            gameId={gameId}
            isDaily={true}
            ascending={true}
            pointsName="Intentos"
          />
          <LevelPath levels={gamesLinked} />
        </section>
        <section className="w-full max-w-lg flex flex-col items-center gap-3 bg-primary/80 p-2 rounded-2xl shadow-xl border border-secondary/30 backdrop-blur-sm">
          <GameModeSelector
            gameModeCONF={GameModeConfig}
            actualGameMode={gameMode}
          />
          {gameStatus === "playing" ? (
            <ArknightsHeroInput className="mask-b-from-70" isDefault={false} />
          ) : (
            <ArknightsCorrectBanner
              imageURL={getWikiImageURL(target.name)}
              name={target.name}
              stars={stars}
            />
          )}
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
        </section>

        <GuessesTable guesses={enrichedGuesses} columns={Columns} />
      </div>
    </RequirePlayer>
  );
}

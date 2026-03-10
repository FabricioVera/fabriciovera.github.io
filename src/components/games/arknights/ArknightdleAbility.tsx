// REACT
import { useEffect, useState } from "react";

// COMPONENTS
import Pointer from "@components/ui/Pointer";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";

// TYPES
import type { OperatorDTO } from "src/types/index";
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
import CorrectBanner from "../CorrectBanner";
import Button from "../../ui/General/Button";
import { CalendarIcon, FlagIcon, InfinityIcon } from "../../Icons";
import { DiceRollerButton } from "../../ui/General/DiceRoller";
import MultiVoicePlayer from "../../ui/Player/VoicePlayer";
import { useArknightStore } from "./ArknightsStore/useArknightStore";
import ToggleSwitch from "../../ui/General/ToggleSwitch";
import AutocompleteInputStore from "./ArknightsStore/AutocompleteInputStore";
import HeroInput from "../../ui/InputHero";
import { LevelCard } from "./specificComponents/LevelCard";
import { gamesArknightdle } from "../../../data/games";
import { LevelPath } from "./specificComponents/ArknightsLevelPath";
import { ArknightsCorrectBanner } from "./specificComponents/ArknightsCorrectBanner";
import { getWikiImageURL, getWikiImageURLAbility } from "../../../utils";
import { loadDailyProgress } from "../../../services/dailyStorageRepository";
import ArknightsHeroInput from "./specificComponents/ArknightsInputHero";

interface ArknightDLEProps {
  gameId: string;
}

export default function ArknightDLEAbility({ gameId }: ArknightDLEProps) {
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
  useEffect(() => {
    init(gameId, playerName);
  }, [gameId, playerName, init]);

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

  const abilityImageURL1 = getWikiImageURLAbility(`Skill-${target.name}1`);
  const abilityImageURL2 = getWikiImageURLAbility(`Skill-${target.name}2`);
  const abilityImageURL3 = getWikiImageURLAbility(`Skill-${target.name}3`);

  return (
    <RequirePlayer>
      <div className="flex flex-col items-center gap-1 p-2">
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

          <div className="h-40 w-full flex flex-row justify-around">
            <div className="relative w-[30%] aspect-square">
              <div
                style={{
                  backgroundImage: `url(${abilityImageURL1})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
                className="w-full h-full flex items-center justify-center pointer-events-none"
              />
            </div>
            <div className="relative w-[30%] aspect-square">
              <div
                style={{
                  backgroundImage: `url(${abilityImageURL2})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
                className="w-full h-full flex items-center justify-center pointer-events-none"
              />
            </div>
            <div className="relative w-[30%] aspect-square">
              <div
                style={{
                  backgroundImage: `url(${abilityImageURL3})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                }}
                className="w-full h-full flex items-center justify-center pointer-events-none"
              />
            </div>
          </div>

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

          <ToggleSwitch
            label="Sprites"
            checked={sprites}
            onChange={spritesStatus}
          />
        </section>
        <table className="w-fit mt-4 mb-40 bg-primary text-white">
          <TableHeader columns={Columns} />
          <tbody>
            {guesses.map((guess, index) => {
              const guessObj = items?.find(
                (operator) => operator.name === guess.name,
              );
              const targetObj = items?.find(
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

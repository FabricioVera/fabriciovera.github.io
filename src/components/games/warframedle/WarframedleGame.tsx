import { useCallback, useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";

// DATA & STORE
import warframeData from "@data/Warframes_final.json";
import { $playerName } from "@store/playerStore";
import {
  useWarframedleStore,
  MAX_WARFRAME_DAILY_ATTEMPTS,
} from "./hooks/useWarframedle";

// COMPONENTES
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";
import Pointer from "@components/ui/Pointer";
import { RequirePlayer } from "@auth/index";
import GameModeSelector, {
  type GameModeCONF,
} from "@components/ui/GameModeSelector/GameModeSelector";
import CorrectBanner from "@components/games/CorrectBanner";
import { DiceRollerButton } from "@components/ui/General/DiceRoller";
import { CalendarIcon, FlagIcon, InfinityIcon } from "@components/Icons";
import Button from "@components/ui/General/Button";

// UTILS & CONFIGS
import { getWikiThumbnail, getWarframeThumbnailName } from "@utils/index";
import { warframedleColumns } from "@config/gameTableColumns";
import type { preWarframe, Warframe } from "@types/warframe";

interface WarframedleGameProps {
  gameId: string;
}

export default function WarframedleGame({ gameId }: WarframedleGameProps) {
  const playerName = useStore($playerName);
  const rawData = warframeData as preWarframe[];

  const warframes: Warframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      imageURL: getWikiThumbnail(getWarframeThumbnailName(wf.name)),
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);

  const {
    init,
    guess,
    reroll,
    setGameMode,
    surrender,
    guesses,
    gameStatus,
    target,
    gameMode,
  } = useWarframedleStore();

  useEffect(() => {
    if (warframes.length) {
      init(warframes);
    }
  }, [warframes]);

  const attemptsLeft = MAX_WARFRAME_DAILY_ATTEMPTS - guesses.length;
  const guessedNames = useMemo(() => guesses.map((g) => g.name), [guesses]);
  const suggestions = useMemo(() => {
    return warframes.map((wf) => ({
      name: wf.name,
      imageURL: wf.imageURL,
    }));
  }, [warframes]);

  const handleGuess = useCallback(
    (name: string) => guess(name, playerName),
    [guess, playerName],
  );

  const startDailyMode = useCallback(() => setGameMode("daily"), [setGameMode]);
  const startRandomMode = useCallback(() => setGameMode("random"), [setGameMode]);

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

  if (gameStatus === "loading" || !target) {
    return (
      <div className="w-full text-white text-2xl text-center">
        Cargando objetivo....
      </div>
    );
  }

  const currentHeroWf =
    gameStatus === "playing"
      ? { name: "WARFRAMEDLE", imageURL: undefined }
      : {
          name: target.name,
          imageURL: target.imageURL,
        };

  return (
    <RequirePlayer>
      <div className="flex flex-col items-center p-2 gap-1">
        <Pointer
          className="bg-primary/60 border border-accent text-white shadow-[0_0_25px_var(--color-accent)]"
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

        {gameMode === "daily" && (
          <p className="text-secondary font-semibold">
            Intentos restantes:{" "}
            <span className="text-accent">{attemptsLeft}</span>
          </p>
        )}

        <div className="flex flex-row items-end gap-2 w-full max-w-lg">
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
          {gameStatus === "playing" ? (
            <div className="w-full">
              <AutocompleteInput
                onGuess={handleGuess}
                suggestionList={suggestions}
                guessedNames={guessedNames}
                placeholder="Ash, Mirage, Zephyr..."
              />
            </div>
          ) : (
            <CorrectBanner
              imageURL={currentHeroWf.imageURL || ""}
              name={currentHeroWf.name}
            />
          )}
          {gameMode !== "daily" && (
            <div className="w-12">
              <DiceRollerButton onRoll={reroll} />
            </div>
          )}
        </div>

        {guesses.length > 0 && (
          <div className="overflow-x-auto justify-items-start rounded-2xl border border-(--border) bg-primary shadow-[0_0_30px_rgba(0,0,0,0.6)] mt-4 text-white">
            <table className="w-full">
              <TableHeader columns={warframedleColumns} />
              <tbody>
                {guesses.map((guess, index) => {
                  const guessObj = warframes.find((w) => w.name === guess.name);
                  if (!guessObj) return null;

                  return (
                    <tr
                      key={index}
                      className="bg-secondary hover:bg-primary transition-colors text-center"
                    >
                      {warframedleColumns.map((col, colIndex) => (
                        <TableCell
                          key={colIndex}
                          guess={guessObj}
                          target={target}
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

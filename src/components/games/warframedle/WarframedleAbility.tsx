// DATA
import warframeData from "@data/Warframes_final.json";
import { $playerName } from "@store/playerStore";

// COMPONENTES
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";
import Pointer from "@components/ui/Pointer";
import { RequirePlayer } from "@auth/index";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";
import { abilitydleColumns } from "../../../config/gameTableColumns";

//HOOKS + UTILS
import { useStore } from "@nanostores/react";
import {
  getWikiThumbnail,
  getWarframeImageName,
  getWarframeThumbnailName,
} from "@utils/index";
import { abilityVisuals } from "@utils/ability";

// TYPES
import type { preWarframe, Warframe } from "src/types/warframe";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";
import CorrectBanner from "../CorrectBanner";
import { DiceRollerButton } from "../../ui/General/DiceRoller";
import Button from "../../ui/General/Button";
import { FlagIcon } from "../../Icons";
import { createGameStore } from "../../../store/useGameStorage";
import { getTodayDateString } from "../../../services/dailyStorageRepository";
import {
  saveDailyProgress,
  loadDailyProgress,
} from "../../../services/dailyStorageRepository";
import { useCallback, useEffect, useMemo } from "react";
import {
  extractAbilitiesPool,
  type AbilityTarget,
} from "../../../services/abilitydleService";
import {
  calculateDailyTarget,
  calculateRandomTarget,
} from "../../../utils/game";

const MAX_DAILY_ATTEMPTS = 10;

const useWarframeGame = createGameStore<Warframe, AbilityTarget>({
  gameId: "warframedleabilities",
  maxDailyAttempts: MAX_DAILY_ATTEMPTS,
  getTodayKey: getTodayDateString,
  saveDailyProgress,
  loadDailyProgress,
  generateTarget: (items, mode, gameId) => {
    const abilities = extractAbilitiesPool(items);
    return mode === "daily"
      ? calculateDailyTarget(abilities, gameId)
      : calculateRandomTarget(abilities);
  },
  checkWin: (guess, target) => guess.name === target.warframeName,
});

interface AbilitydleProps {
  gameId: string;
}

export default function WarframedleAbilitiesGame({ gameId }: AbilitydleProps) {
  const playerName = useStore($playerName);
  const rawData = warframeData as preWarframe[];
  const warframes: Warframe[] = useMemo(() => {
    return rawData.map((wf) => ({
      ...wf,
      imageURL: getWikiThumbnail(getWarframeThumbnailName(wf.name)),
      releaseYear: new Date(wf.releaseDate).getFullYear(),
    }));
  }, [rawData]);

  // ESTADO DEL JUEGO
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
  } = useWarframeGame();

  useEffect(() => {
    if (warframes.length) init(warframes);
  }, [warframes]);

  const attemptsLeft = MAX_DAILY_ATTEMPTS - guesses.length;
  const guessedNames = guesses.map((g) => g.name);
  const suggestions = warframes
    .filter((wf) => !wf.isPrime && wf.name !== "Excalibur Umbra")
    .map((wf) => ({
      name: wf.name,
      imageURL: getWikiThumbnail(getWarframeThumbnailName(wf.name)),
    }));

  // Callbacks de UI
  const handleGuess = useCallback(
    (name: string) => guess(name, playerName),
    [guess, playerName],
  );
  const startDailyMode = useCallback(() => setGameMode("daily"), [setGameMode]);
  const startRandomMode = useCallback(
    () => setGameMode("random"),
    [setGameMode],
  );

  const GameModeConfig: GameModeCONF[] = [
    {
      gameModeLabel: <h1>Daily</h1>,
      gameModeName: "daily",
      gameModeHook: startDailyMode,
    },
    {
      gameModeLabel: <h1>Random</h1>,
      gameModeName: "random",
      gameModeHook: startRandomMode,
    },
  ];

  // Renderizado temprano para evitar errores con variables indefinidas
  if (gameStatus === "loading" || !target) {
    return (
      <div className="text-white text-center p-4">Cargando habilidades...</div>
    );
  }

  const imageVisualStyles = abilityVisuals(
    target?.abilityName || "default",
    getWikiThumbnail(getWarframeImageName(target.abilityName + "130xWhite")),
    guesses.length,
    gameStatus,
  );

  return (
    <RequirePlayer>
      <div className="flex flex-col items-center p-2 gap-1">
        {gameMode === "daily" && (
          <Pointer
            playerName={playerName}
            score={guesses.length}
            gameId={gameId}
            isDaily={true}
            ascending={true}
            pointsName="Intentos"
          />
        )}
        <GameModeSelector
          gameModeCONF={GameModeConfig}
          actualGameMode={gameMode}
        />

        {gameMode === "daily" && (
          <p className="text-white font-semibold">
            Intentos restantes:{" "}
            <span className="text-accent">{attemptsLeft}</span>
          </p>
        )}
        <div className="relative w-40 h-40 md:w-48 md:h-48 overflow-hidden rounded-xl bg-primary shadow-lg border border-secondary flex items-center justify-center">
          <div
            style={imageVisualStyles}
            className="w-full h-full flex items-center justify-center pointer-events-none"
          />
        </div>

        <div className="flex flex-row items-end gap-2 w-full max-w-lg">
          {gameMode !== "daily" && (
            <div className="w-12">
              <Button
                onClick={surrender}
                title="Rendirse FF :("
                aria-label="Rendirse FF :("
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
              imageURL={getWikiThumbnail(
                getWarframeThumbnailName(target.warframeName),
              )}
              name={target.warframeName}
            />
          )}
          {gameMode !== "daily" && (
            <>
              <div className="w-12">
                <DiceRollerButton onRoll={reroll} />
              </div>
            </>
          )}
        </div>
        <div className="max-h-48 overflow-y-scroll scrollbar-thin mt-4">
          <table className="w-fit bg-primary text-white">
            <TableHeader columns={abilitydleColumns} />
            <tbody>
              {guesses.map((guess, index) => {
                const guessObj = warframes.find((w) => w.name === guess.name);
                const targetObj = warframes.find(
                  (w) => w.name === target.warframeName,
                );
                if (!guessObj) return null;

                return (
                  <tr key={index}>
                    {abilitydleColumns.map((col, colIndex) => (
                      <TableCell
                        key={colIndex + "-" + col.header}
                        guess={guessObj}
                        target={
                          targetObj as unknown as Warframe
                        } /* Ajusta el tipo según tu target real */
                        columnDef={col}
                      />
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </RequirePlayer>
  );
}

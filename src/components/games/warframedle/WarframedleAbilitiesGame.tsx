// DATA
import warframeData from "@data/Warframes_final.json";
import { $playerName } from "@store/playerStore";

// COMPONENTES
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import { useAutocomplete } from "@components/ui/Autocomplete/useAutocomplete";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";
import Pointer from "@components/ui/Pointer";
import { RequirePlayer } from "@auth/index";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";
import { abilitydleColumns } from "./GuessedTable/warframeColumns";

//HOOKS + UTILS
import { useStore } from "@nanostores/react";
import { getWikiThumbnail, getWarframeImageName } from "@utils/index";
import { useAbilityVisuals } from "@utils/game";
import useWarframedleAbilities from "./useWarframedleAbilities";

// TYPES
import type { preWarframe, Warframe } from "src/types/warframe";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";

interface AbilitydleProps {
  gameId: string;
}

export default function WarframedleAbilitiesGame({ gameId }: AbilitydleProps) {
  const playerName = useStore($playerName);

  const renderWarframeSuggestion = (sug: any) => (
    <div className="flex flex-row items-center gap-3">
      {sug.wikiaThumbnail && (
        <img
          src={`https://wiki.warframe.com/images/${sug.name.replace(" ", "")}_Thumb.png`}
          alt={sug.name}
          className="w-8 h-8 object-contain rounded-md p-1 bg-slate-900/50"
        />
      )}
      <span>{sug.name}</span>
    </div>
  );

  // ESTADO DEL JUEGO
  const {
    warframes,
    warframeNames,
    target,
    attemptsLeft,
    gameMode,
    guesses,
    status,
    handleGuess,
    startDailyMode,
    startRandomMode,
  } = useWarframedleAbilities(
    warframeData as preWarframe[],
    gameId,
    playerName,
  );
  const guessedNames = guesses.map((g) => g.name);
  const warframesNoPrime = warframes.filter(
    (wf) => !wf.isPrime && wf.name !== "Excalibur Umbra",
  );

  const {
    inputRef,
    inputValue,
    isSubmitting,
    suggestions,
    showSuggestions,
    selectedSuggestion,
    selectDirection,
    errorMessage,
    handleChange,
    handleClean,
    handleSubmit,
    handleSuggestionClick,
    handleKeyDown,
  } = useAutocomplete(
    handleGuess,
    warframesNoPrime,
    guessedNames,
    status !== "playing",
  );

  const GameModeConfig: GameModeCONF[] = [
    { gameModeName: "daily", gameModeHook: startDailyMode },
    { gameModeName: "random", gameModeHook: startRandomMode },
  ];

  const imageVisualStyles = useAbilityVisuals(
    target?.abilityName || "default",
    getWikiThumbnail(getWarframeImageName(target.abilityName + "130xWhite")),
    guesses.length,
    status,
  );

  return (
    <RequirePlayer>
      <div className="min-h-screen w-full max-w-[100vw] lg:max-w-5xl mx-auto p-4 flex flex-col lg:items-center gap-6 overflow-auto">
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
        <div className="relative w-40 h-40 md:w-48 md:h-48 overflow-hidden rounded-xl bg-primary shadow-lg border border-secondary flex items-center justify-center">
          <div
            style={imageVisualStyles}
            className="w-full h-full flex items-center justify-center pointer-events-none"
          />
        </div>

        {status === "playing" && (
          <AutocompleteInput
            inputRef={inputRef}
            inputValue={inputValue}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            selectedSuggestion={selectedSuggestion}
            disabled={false}
            renderSuggestion={renderWarframeSuggestion}
            errorMessage={errorMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            onSuggestionClick={handleSuggestionClick}
            placeholder="Escribe un Warframe"
          />
        )}
        {gameMode === "daily" && status === "playing" && (
          <p className="text-secondary font-semibold">
            Intentos restantes:{" "}
            <span className="text-accent">{attemptsLeft}</span>
          </p>
        )}
        <table className="w-full mt-4 bg-primary text-white">
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
    </RequirePlayer>
  );
}

// DATA
import warframeData from "@data/Warframes_final.json";
import { $playerName } from "@store/playerStore";

// COMPONENTES
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import HeroInput from "@components/ui/InputHero";
import { useAutocomplete } from "@components/ui/Autocomplete/useAutocomplete";
import TableHeader from "@components/ui/GuessedTable/TableHeader";
import TableCell from "@components/ui/GuessedTable/TableCell";
import Pointer from "../Pointer";
import { RequirePlayer } from "@auth/index";
import GameModeSelector from "@components/ui/GameModeSelector/GameModeSelector";

//HOOKS + UTILS
import useWarframedle from "./useWarframedle";
import { useStore } from "@nanostores/react";
import {
  getWikiThumbnail,
  getWarframeThumbnailName,
  getWarframeImageName,
} from "@utils/index";

// TYPES
import type { preWarframe } from "src/types/warframe";
import type { GameModeCONF } from "@components/ui/GameModeSelector/GameModeSelector";
import { warframedleColumns } from "./GuessedTable/warframeColumns";

export default function WarframedleGame() {
  const playerName = useStore($playerName);

  const renderWarframeSuggestion = (sug: any) => (
    <div className="flex flex-row items-center gap-3">
      {sug.wikiaThumbnail && (
        <img
          src={getWikiThumbnail(getWarframeThumbnailName(sug.name))}
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
    targetWarframe,
    attemptsLeft,
    gameMode,
    guesses,
    status,
    handleGuess,
    startDailyMode,
    startRandomMode,
  } = useWarframedle(warframeData as preWarframe[], "warframedle", playerName);
  const guessedNames = guesses.map((g) => g.name);

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
    warframes,
    guessedNames,
    status !== "playing",
  );

  const isDefaultState = selectedSuggestion < 0 || suggestions.length === 0;
  const currentHeroWf = !isDefaultState
    ? suggestions[selectedSuggestion]
    : { name: "WARFRAMEDLE", wikiaThumbnail: undefined };

  const GameModeConfig: GameModeCONF[] = [
    { gameModeName: "daily", gameModeHook: startDailyMode },
    { gameModeName: "random", gameModeHook: startRandomMode },
  ];

  return (
    <RequirePlayer>
      <div className="min-h-screen w-full max-w-[100vw] lg:max-w-5xl mx-auto p-4 flex flex-col lg:items-center gap-6 overflow-auto">
        <GameModeSelector
          gameModeCONF={GameModeConfig}
          actualGameMode={gameMode}
        />
        {gameMode === "daily" && (
          <Pointer
            playerName={playerName}
            score={guesses.length}
            gameId="warframedle"
            isDaily={true}
            ascending={true}
            pointsName="Intentos"
          />
        )}
        <HeroInput
          className="mask-b-from-70"
          key={currentHeroWf.name}
          itemName={currentHeroWf.name}
          thumbnailUrl={getWikiThumbnail(
            getWarframeThumbnailName(currentHeroWf.name),
          )}
          selectDirection={selectDirection}
          isDefault={isDefaultState}
        />
        {status !== "playing" && (
          <div className="flex flex-col justify-center items-center bg-primary/50 border border-accent text-white p-4 rounded-lg text-center">
            <HeroInput
              className="p-0 mask-b-from-70"
              key={targetWarframe.name}
              itemName={targetWarframe.name}
              thumbnailUrl={getWikiThumbnail(
                getWarframeThumbnailName(targetWarframe.name),
              )}
              selectDirection={selectDirection}
              isDefault={false}
            />
          </div>
        )}

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

        {guesses.length > 0 && (
          <div className="overflow-x-auto justify-items-start rounded-2xl border border-secondary bg-primary mt-4 text-white">
            <table className="w-full">
              <TableHeader columns={warframedleColumns} />
              <tbody>
                {guesses.map((guess, index) => {
                  // Necesitas buscar el objeto completo basado en el string almacenado
                  const guessObj = warframes.find((w) => w.name === guess.name);
                  if (!guessObj) return null;

                  return (
                    <tr key={index} className="bg-secondary text-center">
                      {warframedleColumns.map((col, colIndex) => (
                        <TableCell
                          key={colIndex}
                          guess={guessObj}
                          target={
                            targetWarframe
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
        )}
      </div>
    </RequirePlayer>
  );
}

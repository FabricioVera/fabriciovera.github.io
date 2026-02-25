// DATA
import warframeData from "@data/Warframes_final.json";
import { WARFRAMEDLECONFIG } from "@data/warframedle";
import { $playerName } from "../../../store/playerStore";

// COMPONENTES
import AutocompleteInput from "@components/ui/Autocomplete/AutocompleteInput";
import HeroInput from "@components/ui/InputHero";
import { useAutocomplete } from "@components/ui/Autocomplete/useAutocomplete";
import TableHeader from "./GuessedTable/TableHeader";
import TableCell from "./GuessedTable/TableCell";
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

  const tableHeaderNames = WARFRAMEDLECONFIG.map(
    (conf) => conf.tableHeaderName,
  );

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
        <HeroInput
          className=""
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
            <Pointer
              playerName={playerName}
              score={attemptsLeft ? attemptsLeft + 1 : 0}
              gameId="warframedle"
            />
            <HeroInput
              className="p-0"
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
          <div className="overflow-x-auto justify-items-start rounded-2xl border border-secondary mt-4">
            <table className="w-full text-center text-white ">
              <TableHeader
                tableHeaderNames={tableHeaderNames}
                classes="bg-secondary"
              />
              <tbody className="bg-primary/80">
                {guesses.map((guess) => (
                  <tr
                    key={guess.name}
                    className="border-b border-accent animate-in fade-in slide-in-from-top-2"
                  >
                    {WARFRAMEDLECONFIG.map((col, index) => (
                      <TableCell
                        key={`${guess.name}-${index}`}
                        guessImage={getWikiThumbnail(
                          getWarframeImageName(guess.name),
                        )}
                        guess={guess}
                        dailyWarframe={targetWarframe}
                        columnCONF={col}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RequirePlayer>
  );
}

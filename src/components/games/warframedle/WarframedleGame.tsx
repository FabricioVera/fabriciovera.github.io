// DATA
import warframeData from "@data/Warframes_final.json";
import { WARFRAMEDLECONFIG } from "@data/warframedle";
import { $playerName } from "../../../store/playerStore";

// COMPONENTES
import AutocompleteInput from "@components/ui/AutocompleteInput";
import HeroInput from "@components/ui/InputHero";
import { useGuessInput } from "@components/ui/GuessInput/useGuessInput";
import TableHeader from "./GuessedTable/TableHeader";
import TableCell from "./GuessedTable/TableCell";
import Pointer from "../Pointer";
import { RequirePlayer } from "@auth/index";

//HOOKS + UTILS
import useWarframedle from "./useWarframedle";
import { useStore } from "@nanostores/react";
import { getWikiThumbnail, getWarframeThumbnailName } from "src/utils/index";

// TYPES
import type { preWarframe } from "src/types/warframe";

export default function WarframedleGame() {
  const playerName = useStore($playerName);
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
  } = useGuessInput(handleGuess, warframes, guessedNames, status !== "playing");

  const isDefaultState = selectedSuggestion < 0 || suggestions.length === 0;
  const currentHeroWf = !isDefaultState
    ? suggestions[selectedSuggestion]
    : { name: "WARFRAMEDLE", wikiaThumbnail: undefined };

  const tableHeaderNames = WARFRAMEDLECONFIG.map(
    (conf) => conf.tableHeaderName,
  );

  return (
    <RequirePlayer>
      <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center gap-6">
        <div className="flex gap-4 p-2 bg-primary/30 rounded-lg border border-secondary">
          <button
            onClick={startDailyMode}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${gameMode === "daily" ? "bg-accent text-white" : "text-gray-400 hover:text-white"}`}
          >
            Diario
          </button>
          <button
            onClick={startRandomMode}
            className={`px-4 py-2 rounded-md font-bold transition-colors ${gameMode === "random" ? "bg-accent text-white" : "text-gray-400 hover:text-white"}`}
          >
            Aleatorio Infinito
          </button>
        </div>
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
              score={attemptsLeft ? attemptsLeft : 0}
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
            errorMessage={errorMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            onSuggestionClick={handleSuggestionClick}
          />
        )}
        {gameMode === "daily" && status === "playing" && (
          <p className="text-secondary font-semibold">
            Intentos restantes:{" "}
            <span className="text-accent">{attemptsLeft}</span>
          </p>
        )}

        {guesses.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-secondary mt-4">
            <table className="w-full text-center text-white whitespace-nowrap">
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

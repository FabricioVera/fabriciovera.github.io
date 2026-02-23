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
import NameForm from "../../auth/NameForm";
import Pointer from "../Pointer";

//HOOKS + UTILS
import useWarframedle from "./useWarframedle";
import { useStore } from "@nanostores/react";
import { getWikiThumbnail, getWarframeThumbnailName } from "src/utils/index";

// TYPES
import type { preWarframe } from "src/types/warframe";

export default function WarframedleGame() {
  // verificar si existe player
  const playerName = useStore($playerName);
  if (!playerName) {
    return <NameForm />;
  }

  // ESTADO DEL JUEGO
  const { warframes, dailyWarframe, guesses, status, handleGuess } =
    useWarframedle(warframeData as preWarframe[]);
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
  } = useGuessInput(handleGuess, warframes, guessedNames, status === "won");

  const isDefaultState = selectedSuggestion < 0 || suggestions.length === 0;

  const currentHeroWf = !isDefaultState
    ? suggestions[selectedSuggestion]
    : { name: "WARFRAMEDLE", wikiaThumbnail: undefined };

  let tableHeaderNames: string[] = [];
  WARFRAMEDLECONFIG.map((conf) => {
    tableHeaderNames.push(conf.tableHeaderName);
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center gap-6">
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
      {status === "won" ? (
        <div className="flex flex-col justify-center items-center bg-primary/50 border border-accent text-white p-4 rounded-lg text-center">
          <h1>Correcto! era </h1>
          <HeroInput
            className="p-0"
            key={dailyWarframe.name}
            itemName={dailyWarframe.name}
            thumbnailUrl={getWikiThumbnail(
              getWarframeThumbnailName(dailyWarframe.name),
            )}
            selectDirection={selectDirection}
            isDefault={false}
          />
          <Pointer playerName={playerName} score={0} />
        </div>
      ) : (
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
                      dailyWarframe={dailyWarframe}
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
  );
}

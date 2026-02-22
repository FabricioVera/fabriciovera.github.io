import warframeData from "@data/Warframes_final.json";
import AutocompleteInput from "@components/ui/AutocompleteInput";
import HeroInput from "@components/ui/InputHero";
import type { Warframe } from "src/types/warframe";
import useWarframedle from "./useWarframedle";
import { useGuessInput } from "@components/ui/GuessInput/useGuessInput";

export default function WarframedleGame() {
  // ESTADO DEL JUEGO
  const { warframes, dailyWarframe, guesses, status, handleGuess } =
    useWarframedle(warframeData as Warframe[]);
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

  const currentHeroWf =
    selectedSuggestion >= 0 && suggestions.length > 0
      ? suggestions[selectedSuggestion]
      : { name: "", wikiaThumbnail: "" };

  const arraysMatch = (arr1: string[], arr2: string[]) =>
    arr1.length === arr2.length && arr1.every((val) => arr2.includes(val));

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center gap-6">
      {status === "won" && (
        <div className="bg-primary/50 border border-accent text-white p-4 rounded-lg text-center">
          <img
            src={dailyWarframe.wikiaThumbnail}
            alt=""
            className="w-48 h-48 object-contain"
          />
          ¡Correcto! Era: {dailyWarframe.name}
        </div>
      )}

      <HeroInput
        key={currentHeroWf.name}
        itemName={currentHeroWf.name}
        thumbnailUrl={currentHeroWf.wikiaThumbnail}
        selectDirection={selectDirection}
      />

      <AutocompleteInput
        inputRef={inputRef}
        inputValue={inputValue}
        suggestions={suggestions}
        showSuggestions={showSuggestions}
        selectedSuggestion={selectedSuggestion}
        disabled={status === "won"}
        errorMessage={errorMessage}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
      />

      {guesses.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-secondary mt-4">
          <table className="w-full text-center text-white whitespace-nowrap">
            <thead className="bg-primary">
              <tr>
                <th className="p-3 border-r border-secondary">Img</th>
                <th className="p-3 border-r border-secondary">Warframe</th>
                <th className="p-3 border-r border-secondary">Prime</th>
                <th className="p-3 border-r border-secondary">Aura</th>
                <th className="p-3 border-r border-secondary">Año</th>
                <th className="p-3 border-r border-secondary">Sexo</th>
                <th className="p-3">Playstyle</th>
              </tr>
            </thead>
            <tbody className="bg-primary/80">
              {guesses.map((guess) => (
                <tr
                  key={guess.name}
                  className="border-b border-slate-700 animate-in fade-in slide-in-from-top-2"
                >
                  <td
                    className={`p-3 font-bold ${guess.wikiaThumbnail === dailyWarframe.wikiaThumbnail ? "bg-accent" : "bg-secondary"}`}
                  >
                    <img
                      src={guess.wikiaThumbnail}
                      alt=""
                      className="w-24 h-24 rounded-full"
                    />
                  </td>
                  <td
                    className={`p-3 font-bold ${guess.name === dailyWarframe.name ? "bg-accent" : "bg-secondary"}`}
                  >
                    {guess.name}
                  </td>
                  <td
                    className={`p-3 ${guess.isPrime === dailyWarframe.isPrime ? "bg-green-600" : "bg-red-600"}`}
                  >
                    {guess.isPrime ? "Sí" : "No"}
                  </td>
                  <td
                    className={`p-3 ${guess.aura === dailyWarframe.aura ? "bg-green-600" : "bg-red-600"}`}
                  >
                    {guess.aura || "Ninguna"}
                  </td>
                  <td
                    className={`p-3 ${guess.releaseYear === dailyWarframe.releaseYear ? "bg-green-600" : "bg-red-600"}`}
                  >
                    {guess.releaseYear}
                  </td>
                  <td
                    className={`p-3 ${guess.sex === dailyWarframe.sex ? "bg-green-600" : "bg-red-600"}`}
                  >
                    {guess.sex}
                  </td>
                  <td
                    className={`p-3 ${arraysMatch(guess.playstyle, dailyWarframe.playstyle) ? "bg-green-600" : "bg-red-600"}`}
                  >
                    {guess.playstyle.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

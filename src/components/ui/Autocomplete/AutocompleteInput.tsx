import { useAutocomplete } from "./useAutocomplete";
import HeroInput from "../InputHero";
import type { BaseGameEntity } from "src/types/game";

interface GuessInputProps<T extends BaseGameEntity> {
  onGuess: (guess: string) => void | Promise<void>;
  suggestionList?: T[];
  guessedNames: string[];
  disabled?: boolean;
  placeholder?: string;
}

export default function AutocompleteInput<T extends BaseGameEntity>({
  onGuess,
  suggestionList,
  guessedNames,
  disabled,
  placeholder,
}: GuessInputProps<T>) {
  if (!suggestionList) return;
  const {
    inputRef,
    inputValue,
    suggestions,
    showSuggestions,
    selectedSuggestion,
    errorMessage,
    selectDirection,
    handleChange,
    handleSubmit,
    handleSuggestionClick,
    handleKeyDown,
  } = useAutocomplete(onGuess, suggestionList, guessedNames, disabled);

  return (
    <div className={`relative w-full max-w-3xl mx-auto`}>
      <div className="flex flex-column gap-2 justify-center mb-2">
        {/* Mensaje de error */}
        {errorMessage && (
          <p className={`text-sm mt-1 absolute -top-6 left-0 text-red-500`}>
            {errorMessage}
          </p>
        )}
        {selectedSuggestion !== -1 ? (
          <HeroInput
            className="mask-b-from-70"
            key={suggestions[selectedSuggestion].name}
            itemName={suggestions[selectedSuggestion].name}
            thumbnailUrl={suggestions[selectedSuggestion].imageURL}
            selectDirection={selectDirection}
            isDefault={false}
          />
        ) : (
          <div className="h-[25vh] md:h-[35vh]"></div>
        )}
      </div>

      {/* FORMULARIO DEL INPUT */}
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-row text-white"
      >
        <input
          className={`w-full p-2  focus:outline-none transition-colors rounded-xl bg-primary border border-secondary  focus:ring-2 focus:ring-(--color-accent) focus:border-(--color-accent)`}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="submit"
          aria-label="Enviar"
          title="Enviar"
          className="p-2 absolute right-2 transition-colors hover:text-accent"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </form>

      {/* SUGERENCIAS */}
      {suggestions.length > 0 && showSuggestions && (
        <ul
          className={`absolute top-full z-10 w-full rounded mt-1 max-h-60 overflow-y-auto bg-primary border border-secondary`}
        >
          {suggestions.map((sug, index) => (
            <li
              key={sug.name + "-" + index}
              onMouseDown={() => handleSuggestionClick(sug.name)}
              className={`flex flex-row items-center gap-3 px-4 py-2 cursor-pointer transition-all ${
                index === selectedSuggestion
                  ? "bg-accent text-black shadow-[0_0_15px_var(--color-accent)]"
                  : "hover:bg-secondary text-white"
              }`}
            >
              <div className="flex flex-row items-center gap-3">
                <img
                  src={sug.imageURL}
                  alt=""
                  className="w-8 h-8 object-contain rounded-md p-1 bg-secondary/50"
                />
                {sug.name}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

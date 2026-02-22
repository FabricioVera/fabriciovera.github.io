import type { Suggestion } from "../../types";

interface GuessInputProps<T extends Suggestion> {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  suggestions: T[];
  showSuggestions: boolean;
  selectedSuggestion: number;
  disabled?: boolean;
  placeholder?: string;
  errorMessage?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSuggestionClick: (name: string) => void;
}

export default function AutocompleteInput<T extends Suggestion>({
  inputRef,
  inputValue,
  suggestions,
  showSuggestions,
  selectedSuggestion,
  disabled,
  placeholder,
  errorMessage,
  onChange,
  onKeyDown,
  onSubmit,
  onSuggestionClick,
}: GuessInputProps<T>) {
  return (
    <div className="relative w-full max-w-md mx-auto ">
      {/* Mensaje de error */}
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1 absolute">{errorMessage}</p>
      )}

      {/* FORMULARIO DEL INPUT */}
      <form onSubmit={onSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={onChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full p-2 rounded border border-secondary bg-primary text-white focus:outline-none focus:ring-2 focus:ring-accent outline-none"
        />
      </form>

      {/* SUGERENCIAS */}
      {suggestions.length > 0 && showSuggestions && (
        <ul className="absolute top-full z-10 w-full bg-primary rounded mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((sug, index) => (
            <li
              key={sug.name}
              onMouseDown={() => onSuggestionClick(sug.name)}
              className={`flex flex-row items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                index === selectedSuggestion
                  ? "bg-accent text-white"
                  : "hover:bg-secondary text-white"
              }`}
            >
              {sug.wikiaThumbnail && (
                <img
                  src={sug.wikiaThumbnail}
                  alt={sug.name}
                  className="w-8 h-8 object-contain rounded-md p-1"
                />
              )}
              {sug.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import type { Suggestion } from "src/types";

export interface AutocompleteTheme {
  inputWrapper?: string;
  input?: string;
  list?: string;
  item?: string;
  itemActive?: string;
  error?: string;
}

interface GuessInputProps<T extends Suggestion> {
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  suggestions: T[];
  showSuggestions: boolean;
  selectedSuggestion: number;
  disabled?: boolean;
  placeholder?: string;
  errorMessage?: string | null;
  theme?: AutocompleteTheme;
  renderSuggestion?: (suggestion: T) => React.ReactNode;
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
  theme = {},
  renderSuggestion,
  onChange,
  onKeyDown,
  onSubmit,
  onSuggestionClick,
}: GuessInputProps<T>) {
  const inputClasses =
    theme.input || "bg-primary text-white border-secondary focus:ring-accent";
  const listClasses = theme.list || "bg-primary";
  const itemClasses = theme.item || "hover:bg-secondary text-white";
  const activeItemClasses = theme.itemActive || "bg-accent text-white";
  const errorClasses = theme.error || "text-red-500";

  return (
    <div
      className={`relative w-full max-w-md mx-auto ${theme.inputWrapper || ""}`}
    >
      {/* Mensaje de error */}
      {errorMessage && (
        <p className={`text-sm mt-1 absolute -top-6 left-0 ${errorClasses}`}>
          {errorMessage}
        </p>
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
          className={`w-full p-2 rounded border focus:outline-none focus:ring-2 transition-colors ${inputClasses}`}
        />
      </form>

      {/* SUGERENCIAS */}
      {suggestions.length > 0 && showSuggestions && (
        <ul
          className={`absolute top-full z-10 w-full rounded mt-1 max-h-48 overflow-y-auto ${listClasses}`}
        >
          {suggestions.map((sug, index) => (
            <li
              key={sug.name + "-" + index}
              onMouseDown={() => onSuggestionClick(sug.name)}
              className={`flex flex-row items-center gap-3 px-4 py-2 cursor-pointer transition-colors ${
                index === selectedSuggestion ? activeItemClasses : itemClasses
              }`}
            >
              {renderSuggestion ? renderSuggestion(sug) : sug.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

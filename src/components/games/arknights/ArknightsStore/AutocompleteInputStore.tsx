import { useEffect, useRef } from "react";
import { useArknightStore } from "./useArknightStore";

interface GuessInputProps {
  disabled?: boolean;
  placeholder?: string;
}

export default function AutocompleteInputStore({
  disabled,
  placeholder,
}: GuessInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const {
    inputValue,
    filteredSuggestions,
    selectedSuggestionIndex,
    setInputValue,
    guess,
    handleKeyDown,
    setSelectedSuggestionIndex,
  } = useArknightStore();

  const hasValidInput = inputValue.trim().length > 0;
  const hasSuggestions =
    Array.isArray(filteredSuggestions) && filteredSuggestions.length > 0;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      handleKeyDown(e.key);
      if (e.key === "Enter") {
        // Pequeño timeout para mantener el foco después del reset del form
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      guess(inputValue.trim());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const onSuggestionClick = (name: string) => {
    guess(name);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (listRef.current && selectedSuggestionIndex >= 0) {
      const selectedItem = listRef.current.children[
        selectedSuggestionIndex
      ] as HTMLLIElement;

      if (selectedItem) {
        selectedItem.scrollIntoView({
          behavior: "auto",
          block: "nearest",
        });
      }
    }
  }, [selectedSuggestionIndex]);

  return (
    <div className={`relative w-full max-w-3xl mx-auto`}>
      {/* FORMULARIO DEL INPUT */}
      <form onSubmit={onSubmit} className="relative flex flex-row text-white">
        <input
          name="operator name"
          className={`w-full p-2  focus:outline-none transition-colors rounded-xl bg-primary border border-secondary  focus:ring-2 focus:ring-(--color-accent) focus:border-(--color-accent)`}
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={onChange}
          onKeyDown={onKeyDown}
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
      {hasValidInput && hasSuggestions && (
        <ul
          ref={listRef}
          className={`absolute top-full z-10 w-full rounded mt-1 max-h-60 overflow-y-auto bg-primary border border-secondary`}
        >
          {filteredSuggestions.map((sug, index) => (
            <li
              key={`${sug.name}-${index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                onSuggestionClick(sug.name);
              }}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              className={`flex flex-row items-center gap-3 px-4 py-2 cursor-pointer transition-all ${
                index === selectedSuggestionIndex
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

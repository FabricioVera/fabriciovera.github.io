import { create } from "zustand";
import { type OperatorDTO } from "src/types/operatorDTO";
import { normalizeString } from "../../../../utils";

interface AutocompleteState {
  inputValue: string;
  filteredSuggestions: OperatorDTO[];
  selectedSuggestionIndex: number;
  selectDirection: number;

  // Acciones
  setSearch: (
    value: string,
    items: OperatorDTO[],
    guesses: OperatorDTO[],
    gameId: string,
  ) => void;
  navigateList: (direction: "up" | "down") => void;
  resetSearch: () => void;
  setSelectedSuggestionIndex: (index: number) => void;
}

export const useAutocompleteStore = create<AutocompleteState>((set, get) => ({
  inputValue: "",
  filteredSuggestions: [],
  selectedSuggestionIndex: -1,
  selectDirection: -1,

  setSearch: (value, items, guesses, gameId) => {
    if (!value.trim()) {
      set({
        inputValue: value,
        filteredSuggestions: [],
        selectedSuggestionIndex: -1,
      });
      return;
    }
    console.log("set search: ", value);

    const normalizedValue = normalizeString(value);
    const normalizedGuessedNames = guesses.map((g) => normalizeString(g.name));

    let filtered = items
      .filter(
        (item) =>
          normalizeString(item.name).includes(normalizedValue) &&
          !normalizedGuessedNames.includes(normalizeString(item.name)),
      )
      .sort((a, b) => {
        const nameA = normalizeString(a.name);
        const nameB = normalizeString(b.name);
        const aStartsWith = nameA.startsWith(normalizedValue);
        const bStartsWith = nameB.startsWith(normalizedValue);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return nameA.localeCompare(nameB);
      });

    if (gameId === "arknightdleability") {
      filtered = filtered.filter((item) => item.rarity > 3);
    }

    set({
      inputValue: value,
      filteredSuggestions: filtered,
      selectedSuggestionIndex: filtered.length > 0 ? 0 : -1,
    });
  },

  navigateList: (direction) => {
    const { filteredSuggestions, selectedSuggestionIndex } = get();
    if (filteredSuggestions.length === 0) return;

    if (direction === "up") {
      set({
        selectedSuggestionIndex:
          selectedSuggestionIndex <= 0
            ? filteredSuggestions.length - 1
            : selectedSuggestionIndex - 1,
        selectDirection: -1,
      });
    } else {
      set({
        selectedSuggestionIndex:
          selectedSuggestionIndex >= filteredSuggestions.length - 1
            ? 0
            : selectedSuggestionIndex + 1,
        selectDirection: 1,
      });
    }
  },

  resetSearch: () =>
    set({
      inputValue: "",
      filteredSuggestions: [],
      selectedSuggestionIndex: -1,
      selectDirection: -1,
    }),

  setSelectedSuggestionIndex: (index) =>
    set({ selectedSuggestionIndex: index }),
}));

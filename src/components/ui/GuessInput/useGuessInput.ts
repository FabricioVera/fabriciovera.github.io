import { useState, useCallback, useRef, useMemo } from "react";
import type { Suggestion } from "src/types";
import { normalizeString } from "src/utils/index";

export function useGuessInput<T extends Suggestion>(
  onGuess: (guess: string) => void | Promise<void>,
  allElements: T[],
  guessedNames: string[],
  disabled?: boolean,
) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [selectDirection, setSelectDirection] = useState(-1);

  // Limpiar sugerencias
  const resetSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  }, []);

  // Seleccion de sugerencias con teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
      setSelectDirection(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((prev) =>
        prev >= suggestions.length - 1 ? 0 : prev + 1,
      );
      setSelectDirection(1);
    } else if (e.key === "Enter" && selectedSuggestion >= 0) {
      setInputValue(suggestions[selectedSuggestion].name);
      resetSuggestions();
    }
  };

  // Logica de cambio de input y filtro para las sugerencias
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setErrorMessage(null);

    if (!value.trim()) {
      resetSuggestions();
      return;
    }

    const normalizedValue = normalizeString(value);
    const normalizedGuessedNames = guessedNames.map(normalizeString);

    const filtered = allElements
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

        // Prioridad 1: 'a' empieza con el valor, 'b' no -> 'a' va primero
        if (aStartsWith && !bStartsWith) return -1;

        // Prioridad 2: 'b' empieza con el valor, 'a' no -> 'b' va primero
        if (!aStartsWith && bStartsWith) return 1;

        // Prioridad 3: Ambos empiezan o ninguno empieza
        // Ordenar alfabéticamente como desempate
        return nameA.localeCompare(nameB);
      })
      .slice(0, 5);

    setSuggestions(filtered);
    // Mostrar solo si existen sugerencias
    setShowSuggestions(filtered.length > 0);
    // Selecciona el primer elemento si hay sugerencias
    setSelectedSuggestion(filtered.length > 0 ? 0 : -1);
  };

  const handleSuggestionClick = (name: string) => {
    setInputValue(name);
    resetSuggestions();
  };

  // Limpieza de input y sugerencias
  const handleClean = () => {
    setInputValue("");
    resetSuggestions();
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const value = inputValue.trim();
      if (!value || disabled || isSubmitting) return;

      const normalizedValue = normalizeString(value);
      const normalizedGuessedNames = guessedNames.map(normalizeString);

      // Validar si existe
      const match = allElements.find(
        (item) => normalizeString(item.name) === normalizedValue,
      );
      if (!match) {
        setErrorMessage(`${value} no es un elemento válido.`);
        return;
      }

      // Si ya fue adivinado
      const alreadyGuessed = normalizedGuessedNames.includes(normalizedValue);
      if (alreadyGuessed) {
        setErrorMessage(`${match.name} ya fue adivinado.`);
        return;
      }

      // enviar guess
      setIsSubmitting(true);
      try {
        await onGuess(match.name);
        setInputValue("");
        resetSuggestions();

        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      inputValue,
      onGuess,
      disabled,
      isSubmitting,
      allElements,
      guessedNames,
      resetSuggestions,
    ],
  );

  // se usa useMemo para utilizar el hook solo cuando una dependencia cambia
  return useMemo(
    () => ({
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
    }),
    [
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
    ],
  );
}

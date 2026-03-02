import { hasIntersection, haveSameElements } from "@utils/array";

export const MATCH = "bg-success text-center";
export const NOT_MATCH = "bg-error text-center";
export const PARTIAL_MATCH = "bg-warning text-center";

export const createExactMatchClass = <T>(key: keyof T) => {
  return (guess: T, target: T): string => {
    return guess[key] === target[key] ? MATCH : NOT_MATCH;
  };
};

export const createArrayMatchClass = <T>(key: keyof T) => {
  return (guess: T, target: T): string => {
    const guessVal = guess[key];
    const targetVal = target[key];

    if (!Array.isArray(guessVal) || !Array.isArray(targetVal)) {
      return NOT_MATCH;
    }

    if (haveSameElements(guessVal as unknown[], targetVal as unknown[]))
      return MATCH;
    if (hasIntersection(guessVal as unknown[], targetVal as unknown[]))
      return PARTIAL_MATCH;

    return NOT_MATCH;
  };
};

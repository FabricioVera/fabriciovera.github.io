export const haveSameElements = (arr1: unknown[], arr2: unknown[]): boolean => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((value, index) => value === sorted2[index]);
};

export const hasIntersection = (arr1: unknown[], arr2: unknown[]): boolean => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;

  return arr1.some((value) => arr2.includes(value));
};

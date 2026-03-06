import Rand from "rand-seed";
import type { OperatorDTO } from "../types";

export const calculateDailyTarget = (listTarget: any[], gameId: string) => {
  const today = new Date();
  const seed =
    (
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate()
    ).toString() + gameId;

  const rand = new Rand(seed);
  const randomValue = rand.next();

  return listTarget[Math.floor(randomValue * listTarget.length)];
};

export const calculateRandomTarget = (listTarget: any[]) => {
  const randomIndex = Math.floor(Math.random() * listTarget.length);
  return listTarget[randomIndex];
};

export function calculateRandomTargetArknights(listTarget: any[]) {
  const randomRarity = getRandomWithWeight(numbers);

  const filteredTargets = listTarget.filter(
    (op) => op.rarity == randomRarity.toString(),
  );
  return filteredTargets[Math.floor(Math.random() * filteredTargets.length)];
}

type WeightedItem<T> = {
  item: T;
  weight: number;
};

function getRandomWithWeight<T>(options: WeightedItem<T>[]): T {
  // 1. Calculamos la suma total de los pesos
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);

  // 2. Elegimos un número aleatorio entre 0 y el peso total
  let random = Math.random() * totalWeight;

  // 3. Buscamos a qué ítem corresponde ese número
  for (const option of options) {
    if (random < option.weight) {
      return option.item;
    }
    // Si no es este, le restamos el peso y pasamos al siguiente
    random -= option.weight;
  }

  // Fallback por si hay algún error de redondeo en punto flotante
  return options[options.length - 1].item;
}
// Definimos las opciones con sus pesos
const numbers: WeightedItem<number>[] = [
  { item: 1, weight: 9 }, // 9
  { item: 2, weight: 5 }, // 5
  { item: 3, weight: 14 }, // 17
  { item: 4, weight: 30 }, // 59
  { item: 5, weight: 30 }, // 190
  { item: 6, weight: 30 }, // 120
];

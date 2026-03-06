import type { preWarframe, Warframe } from "src/types/warframe";

export interface AbilityTarget {
  warframeName: string;
  abilityName: string;
  imageName: string;
  description: string;
  cardImage?: string;
}

export const extractAbilitiesPool = (
  warframes: Warframe[],
): AbilityTarget[] => {
  const pool: AbilityTarget[] = [];

  warframes
    .filter((wf) => !wf.isPrime && wf.name !== "Excalibur Umbra")
    .forEach((wf) => {
      wf.abilities.forEach((ability) => {
        pool.push({
          warframeName: wf.name,
          abilityName: ability.name,
          imageName: ability.imageName,
          description: ability.description,
          cardImage: ability.cardImage,
        });
      });
    });

  return pool;
};

import type { OperatorDTO } from "src/types/index";
import { logger } from "@services/logger";
import { getWikiImageURL, getWikiSpriteURL } from "@utils/index";
import ArknightsOperatorsData from "@data/operadores_arknightsV2.json";

const removeBrackets = (text: string): string => {
  return text.replace(/[\[\]]/g, "");
};

export const fetchOperators = async (): Promise<OperatorDTO[]> => {
  try {
    const json = ArknightsOperatorsData;

    return json
      .map((item: any) => {
        let race = item.wiki_race;

        if (race && race.includes("|")) {
          race = race.split("|")[1];
        }
        return {
          name: item.value.data.name,
          imageURL: getWikiImageURL(item.value.data.name + "_icon"),
          spriteURL: getWikiSpriteURL(item.value.data.name),
          rarity: item.wiki_rarity,
          sex: item.wiki_gender,
          race: race ? removeBrackets(race) : "",
          affiliation: item.wiki_faction,
          tagList: item.value.data.tagList.filter(
            (tag: string) => tag !== item.wiki_class && tag !== "Top Operator",
          ),
          class: item.wiki_class,
          branch: item.wiki_branch,
          archetype: item.value.archetype,
          images: item.wiki_images,
          skills: item.wiki_skills,
          voice_actors: item.wiki_voice_actors,
          theme: item.wiki_theme,
        };
      })
      .filter((item: any) => !item.name.includes("Reserve"));
  } catch (e) {
    const errorMsg = `Error fetching operators: ${e}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};

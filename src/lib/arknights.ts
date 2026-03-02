import type { OperatorDTO } from "src/types/index";
import { logger } from "@services/logger";
import { getWikiImageURL, getWikiSpriteURL } from "@utils/index";
import ArknightsOperatorsData from "@data/operadores_arknights.json";

const API_ARKNIGHTS_awedtan = "https://awedtan.ca/api/";
const API_ARKNIGHTS = "https://api.rhodesapi.com/api/";

export const fetchOperators_awedtan = async (): Promise<OperatorDTO[]> => {
  try {
    logger.info("Fetching operators...");
    const response = await fetch(
      API_ARKNIGHTS_awedtan +
        "operator?include=data.name&include=data.nationId&include=data.position&include=data.rarity&include=data.tagList&include=data.profession",
    );
    const json = await response.json();

    return json.map((item: any) => ({
      name: item.value.data.name,
      imageURL: getWikiImageURL(item.value.data.name + "_icon"),
      spriteURL: getWikiSpriteURL(item.value.data.name),
      rarity: item.value.data.rarity.split("_")[1],
      race: item.lore.race,
      affiliation: item.value.data.nationId,
      tagList: item.value.data.tagList,
      class: item.value.data.profession,
    }));
  } catch (e) {
    const errorMsg = `Error fetching operators: ${e}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};

export const fetchOperators_rhodesapi = async (): Promise<OperatorDTO[]> => {
  try {
    const response = await fetch(API_ARKNIGHTS + "operator");
    const json = await response.json();
    logger.info("Operators fetched : response " + response.status);

    return json
      .map((item: any) => ({
        name: item.name,
        imageURL: getWikiImageURL(item.name + "_icon"),
        spriteURL: getWikiSpriteURL(item.name),
        rarity: item.rarity,
        sex: item.lore.gender,
        race: item.lore.race,
        affiliation: item.affiliation[0],
        tagList: item.tags.filter(
          (tag: string) => tag !== item.class[0] && tag !== "Top Operator",
        ),
        class: item.class[0],
      }))
      .filter((item: any) => !item.name.includes("Reserve"));
  } catch (e) {
    const errorMsg = `Error fetching operators: ${e}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};

const removeBrackets = (text: string): string => {
  return text.replace(/[\[\]]/g, "");
};
export const fetchOperators = async (): Promise<OperatorDTO[]> => {
  try {
    const json = ArknightsOperatorsData;

    return json
      .map((item: any) => ({
        name: item.value.data.name,
        imageURL: getWikiImageURL(item.value.data.name + "_icon"),
        spriteURL: getWikiSpriteURL(item.value.data.name),
        rarity: item.wiki_rarity,
        sex: item.wiki_gender,
        race: item.wiki_race ? removeBrackets(item.wiki_race) : "",
        affiliation: item.wiki_faction,
        tagList: item.value.data.tagList.filter(
          (tag: string) => tag !== item.wiki_class && tag !== "Top Operator",
        ),
        class: item.wiki_class,
        branch: item.wiki_branch,
      }))
      .filter((item: any) => !item.name.includes("Reserve"));
  } catch (e) {
    const errorMsg = `Error fetching operators: ${e}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};

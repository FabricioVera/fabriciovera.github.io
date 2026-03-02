import type { OperatorDTO } from "src/types/index";
import { logger } from "@services/logger";
import { getWikiIcon } from "@utils/index";

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
      iconURL: getWikiIcon(item.value.data.name + "_icon"),
      archetype: item.value.archetype,
      nationId: item.value.data.nationId,
      position: item.value.data.position,
      rarity: item.value.data.rarity,
      tagList: item.value.data.tagList,
      profession: item.value.data.profession,
    }));
  } catch (e) {
    const errorMsg = `Error fetching operators: ${e}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};

export const fetchOperators = async (): Promise<OperatorDTO[]> => {
  try {
    logger.info("Fetching operators...");
    const response = await fetch(API_ARKNIGHTS + "operator");
    const json = await response.json();

    return json.map((item: any) => ({
      name: item.name,
      iconURL: getWikiIcon(item.name + "_icon"),
      rarity: item.rarity,
      sex: item.lore.gender,
      race: item.lore.race,
      affiliation: item.affiliation[0],
      tagList: item.tags,
      class: item.class[0],
    }));
  } catch (e) {
    const errorMsg = `Error fetching operators: ${e}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }
};

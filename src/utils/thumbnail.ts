export const WIKI_ABILITY_SUFFIX = "130xWhite";

const cleanName = (name: string): string => {
  const pattern = new RegExp("[ -]", "g");
  return name.replace(pattern, "");
};

/**
 * @param imageName:string = "name.png"
 * @returns wiki image name.png
 */
export function getWikiThumbnail(imageName: string) {
  return "https://wiki.warframe.com/images/" + imageName;
}

export function getWarframeThumbnailName(warframeName: string) {
  return cleanName(warframeName) + "_Thumb.png";
}

export function getWarframeImageName(warframeName: string) {
  return cleanName(warframeName) + ".png";
}

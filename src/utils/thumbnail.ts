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

export function getWikiImageURL(name: string) {
  const pattern = new RegExp("[ ]", "g");
  return (
    "https://arknights.wiki.gg/images/" + name.replace(pattern, "_") + ".png"
  );
}

export function getWikiSpriteURL(name: string) {
  const pattern = new RegExp("[ ]", "g");
  return (
    "https://arknights.wiki.gg/images/" + name.replace(pattern, "_") + ".webm"
  );
}

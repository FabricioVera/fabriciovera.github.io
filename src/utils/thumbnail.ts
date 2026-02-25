/**
 * @param imageName:string = "name.png"
 * @returns wiki image name.png
 */
export function getWikiThumbnail(imageName: string) {
  return "https://wiki.warframe.com/images/" + imageName;
}

export function getWarframeThumbnailName(warframeName: string) {
  return warframeName.replace(RegExp("[ -]"), "") + "_Thumb.png";
}

export function getWarframeImageName(warframeName: string) {
  return warframeName.replace(RegExp("[ -]"), "") + ".png";
}

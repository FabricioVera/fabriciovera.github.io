export function getWikiThumbnail(imageName: string) {
  return "https://wiki.warframe.com/images/" + imageName;
}

export function getWarframeThumbnailName(warframeName: string) {
  console.log(warframeName.replace(RegExp("[ -]"), "") + "_Thumb.png");
  return warframeName.replace(RegExp("[ -]"), "") + "_Thumb.png";
}

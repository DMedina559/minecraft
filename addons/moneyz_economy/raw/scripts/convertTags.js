import { world } from "@minecraft/server";

export const convertTagsToProperties = (player) => {
  const tagsToConvert = [
    "moneyzATM",
    "moneyzSend",
    "moneyzShop"
  ];

  tagsToConvert.forEach((tag) => {
    if (player.hasTag(tag)) {
      player.setDynamicProperty(tag, true);
      player.removeTag(tag);
      console.log(
        `Converted tag ${tag} to property for ${player.nameTag}`
      );
    }
  });
};

console.log("tagConverter.js loaded");
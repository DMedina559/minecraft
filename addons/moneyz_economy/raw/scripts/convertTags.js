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

export function updateWorldProperties() {
  const scoreboard = world.scoreboard;
  if (!scoreboard) {
    console.error("Scoreboard not found!");
    return;
  }

  const objectiveName = "moneyzAutoTag";
  const dummyPlayers = ["moneyzShop", "moneyzATM", "moneyzSend"];

  const objective = scoreboard.getObjective(objectiveName);
  if (!objective) {
    console.warn(`Objective "${objectiveName}" does not exist. Skipping update.`);
    return;
  }

  let syncPlayers = false;

  dummyPlayers.forEach(playerName => {
    try {
      const score = objective.getScore(playerName);
      if (score === undefined) {
        console.warn(`"${playerName}" does not exist in the objective "${objectiveName}". Skipping.`);
        return;
      }

      const propertyName = `${playerName}`;
      const propertyValue = score > 0;
      world.setDynamicProperty(propertyName, propertyValue);
      console.log(`Updated world property: ${propertyName} = ${propertyValue}`);

      if (propertyValue) { 
        syncPlayers = true;
      }
    } catch (error) {
      console.error(`Error processing "${playerName}":`, error);
    }
  });

  world.setDynamicProperty('syncPlayers', syncPlayers);
  console.log(`Updated world property: syncPlayers = ${syncPlayers}`);

  try {
    const removed = scoreboard.removeObjective(objectiveName);
    if (removed) {
      console.log(`Scoreboard objective "${objectiveName}" removed successfully.`);
    } else {
      console.error(`Failed to remove scoreboard objective "${objectiveName}".`);
    }
  } catch (error) {
    console.error(`Error removing scoreboard objective "${objectiveName}":`, error);
  }
}

console.log("convertTags.js loaded");
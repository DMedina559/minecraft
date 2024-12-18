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
    const propertyPrefix = "moneyz";

    const objective = scoreboard.getObjective(objectiveName);
    if (!objective) {
        console.error(`Objective "${objectiveName}" not found!`);
        return;
    }

    dummyPlayers.forEach(playerName => {
        const score = objective.getScore(playerName);
        const propertyName = `${propertyPrefix}${playerName}`;

        if (score !== undefined) {
            const propertyValue = score > 0;
            world.setDynamicProperty(propertyName, propertyValue);
            console.log(`Migraged to World Property: ${propertyName} = ${propertyValue}`);
        }
    });

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
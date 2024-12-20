import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from './logger.js';

// Convert moneyzAutoTag scoreboard to World Properties and remove scoreboard
// If any moneyzTag had a score above 0 set the World Property syncPlayers to true else sset to false
export function updateWorldProperties() {
  const scoreboard = world.scoreboard;
  if (!scoreboard) {
    log("Scoreboard not found!", LOG_LEVELS.DEBUG);
    return;
  }

  const objectiveName = "moneyzAutoTag";
  const dummyPlayers = ["moneyzShop", "moneyzATM", "moneyzSend"];

  const objective = scoreboard.getObjective(objectiveName);
  if (!objective) {
    log(`Objective "${objectiveName}" does not exist. Skipping update.`, LOG_LEVELS.DEBUG);
    return;
  }

  let syncPlayers = false;

  dummyPlayers.forEach(playerName => {
    try {
      const score = objective.getScore(playerName);
      if (score === undefined) {
        log(`"${playerName}" does not exist in the objective "${objectiveName}". Skipping.`, LOG_LEVELS.DEBUG);
        return;
      }

      const propertyName = `${playerName}`;
      const propertyValue = score > 0 ? 'true' : 'false';
      world.setDynamicProperty(propertyName, propertyValue);
      log(`Updated world property: ${propertyName} = ${propertyValue}`, LOG_LEVELS.INFO);

      if (propertyValue === 'true') {
        syncPlayers = true;
      }
    } catch (error) {
      log(`Error processing "${playerName}":`, LOG_LEVELS.ERROR, error);
    }
  });

  world.setDynamicProperty('syncPlayers', syncPlayers ? 'true' : 'false');
  log(`Updated world property: syncPlayers = ${syncPlayers ? 'true' : 'false'}`, LOG_LEVELS.INFO);

  try {
    const removed = scoreboard.removeObjective(objectiveName);
    if (removed) {
      log(`Scoreboard objective "${objectiveName}" removed successfully.`, LOG_LEVELS.INFO);
    } else {
      log(`Failed to remove scoreboard objective "${objectiveName}".`, LOG_LEVELS.WARN);
    }
  } catch (error) {
    log(`Error removing scoreboard objective "${objectiveName}":`, LOG_LEVELS.ERROR, error);
  }
};

// Convert legacy moneyzTags to Player Properties
export const convertTagsToProperties = (player) => {
  const tagsToConvert = [
    "moneyzATM",
    "moneyzSend",
    "moneyzShop"
  ];

  tagsToConvert.forEach((tag) => {
    if (player.hasTag(tag)) {
      player.setDynamicProperty(tag, 'true');
      player.removeTag(tag);
      log(`Converted tag ${tag} to property for ${player.nameTag}`, LOG_LEVELS.INFO);
    }
  });
};

log("convertTags.js loaded", LOG_LEVELS.DEBUG);
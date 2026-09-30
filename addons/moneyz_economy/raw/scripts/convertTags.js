import { world } from "@minecraft/server";
import { log, LOG_LEVELS } from "./logger.js";

/**
 * Converts legacy moneyzAutoTag scoreboard values to world properties and removes the objective.
 */
export function updateWorldProperties() {
    const scoreboard = world.scoreboard;
    if (!scoreboard) return;

    const objectiveName = "moneyzAutoTag";
    const dummyPlayers = ["moneyzShop", "moneyzATM", "moneyzSend"];

    const objective = scoreboard.getObjective(objectiveName);
    if (!objective) return;

    let syncPlayers = false;

    dummyPlayers.forEach(playerName => {
        try {
            const score = objective.getScore(playerName);
            if (score === undefined) return;

            const propertyValue = score > 0 ? "true" : "false";
            world.setDynamicProperty(playerName, propertyValue);
            log(`Updated world property: ${playerName} = ${propertyValue}`, LOG_LEVELS.INFO);

            if (propertyValue === "true") {
                syncPlayers = true;
            }
        } catch (error) {
            log(`Error processing "${playerName}": ${error}`, LOG_LEVELS.ERROR);
        }
    });

    world.setDynamicProperty("syncPlayers", syncPlayers ? "true" : "false");

    try {
        const removed = scoreboard.removeObjective(objectiveName);
        if (removed) {
            log(`Scoreboard objective "${objectiveName}" removed successfully.`, LOG_LEVELS.INFO);
        }
    } catch (error) {
        log(`Error removing scoreboard objective "${objectiveName}": ${error}`, LOG_LEVELS.ERROR);
    }
}

/**
 * Converts legacy tags on a player to player dynamic properties.
 * @param {import("@minecraft/server").Player} player
 */
export const convertTagsToProperties = (player) => {
    if (!player) return;

    const tagsToConvert = ["moneyzATM", "moneyzSend", "moneyzShop"];

    tagsToConvert.forEach(tag => {
        if (player.hasTag(tag)) {
            player.setDynamicProperty(tag, "true");
            player.removeTag(tag);
            log(`Converted tag ${tag} to property for ${player.nameTag}`, LOG_LEVELS.INFO);
        }
    });
};

log("convertTags.js loaded", LOG_LEVELS.DEBUG);

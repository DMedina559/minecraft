import { world, system } from "@minecraft/server";
import { main } from "./gui/moneyz_menu.js";
import { convertTagsToProperties, updateWorldProperties } from "./convertTags.js";
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from "./logger.js";
import "./npcInteract.js";

// Initialize system state
system.run(() => {
    ensureWorldPropertiesExist();
    setLogLevelFromWorldProperty();
    updateWorldProperties();
});

/**
 * Gets the scoreboard score for a target using native Scoreboard APIs.
 * @param {string} objective Objective name.
 * @param {import("@minecraft/server").Player|import("@minecraft/server").Entity|import("@minecraft/server").ScoreboardIdentity|string} target Player/Entity, identity, or string.
 * @param {boolean} [useZero=true] Whether to return 0 if score is undefined.
 * @returns {number} Score value.
 */
export const getScore = (objective, target, useZero = true) => {
    const obj = world.scoreboard.getObjective(objective);
    if (!obj || !target) return useZero ? 0 : NaN;

    try {
        let score;
        if (typeof target === "string") {
            const participant = world.scoreboard.getParticipants().find(p => p.displayName === target);
            score = participant ? obj.getScore(participant) : obj.getScore(target);
        } else {
            score = obj.getScore(target);
        }
        return score !== undefined ? score : (useZero ? 0 : NaN);
    } catch {
        return useZero ? 0 : NaN;
    }
};

/**
 * Updates a player's score for the "Moneyz" objective using native Scoreboard APIs.
 * @param {import("@minecraft/server").Player} player
 * @param {number} amount
 * @param {"add"|"remove"|"set"} [operation="add"]
 * @returns {boolean} Success status.
 */
export function updateScore(player, amount, operation = "add") {
    if (!player) {
        log("updateScore: Invalid player provided.", LOG_LEVELS.ERROR);
        return false;
    }

    const objective = world.scoreboard.getObjective("Moneyz");
    if (!objective) {
        log("updateScore: Objective 'Moneyz' not found.", LOG_LEVELS.ERROR);
        return false;
    }

    const roundedAmount = Math.round(amount);

    try {
        switch (operation) {
            case "add":
                objective.addScore(player, roundedAmount);
                break;
            case "remove":
                objective.addScore(player, -roundedAmount);
                break;
            case "set":
                objective.setScore(player, roundedAmount);
                break;
            default:
                log(`updateScore: Invalid operation "${operation}".`, LOG_LEVELS.WARN);
                return false;
        }
        return true;
    } catch (error) {
        log(`updateScore: Error updating score: ${error}`, LOG_LEVELS.ERROR);
        return false;
    }
}

/**
 * Returns current UTC date string formatted as YYYY-MM-DD.
 * @returns {string}
 */
export function getCurrentUTCDate() {
    const date = new Date();
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
}

const ensureWorldPropertiesExist = () => {
    log("Ensuring world properties exist...", LOG_LEVELS.DEBUG);
    const properties = [
        { name: "logLevel", defaultValue: "WARN" },
        { name: "dailyReward", defaultValue: "25" },
        { name: "chanceX", defaultValue: "2" },
        { name: "chanceWin", defaultValue: "50" },
        { name: "syncPlayers", defaultValue: "true" },
        { name: "moneyzATM", defaultValue: "true" },
        { name: "moneyzQuest", defaultValue: "true" },
        { name: "moneyzSend", defaultValue: "true" },
        { name: "oneLuckyPurchase", defaultValue: "true" },
        { name: "moneyzShop", defaultValue: "true" },
        { name: "moneyzDaily", defaultValue: "true" },
        { name: "moneyzLucky", defaultValue: "true" },
        { name: "moneyzChance", defaultValue: "true" }
    ];

    properties.forEach(prop => {
        const currentValue = world.getDynamicProperty(prop.name);
        if (currentValue === undefined) {
            world.setDynamicProperty(prop.name, prop.defaultValue);
        }
    });
};

const ensurePlayerHasMoneyzScore = (player) => {
    const moneyzScore = getScore("Moneyz", player);
    if (moneyzScore === 0) {
        updateScore(player, 0, "set");
    }
};

const syncPlayerPropertiesWithWorld = (player) => {
    const syncPlayers = world.getDynamicProperty("syncPlayers");

    if (syncPlayers === "true") {
        const properties = [
            { name: "moneyzATM", defaultValue: "true" },
            { name: "moneyzSend", defaultValue: "true" },
            { name: "moneyzQuest", defaultValue: "true" },
            { name: "moneyzShop", defaultValue: "true" },
            { name: "moneyzDaily", defaultValue: "true" },
            { name: "moneyzLucky", defaultValue: "true" },
            { name: "moneyzChance", defaultValue: "true" }
        ];

        properties.forEach(prop => {
            const worldValue = world.getDynamicProperty(prop.name);
            const playerValue = player.getDynamicProperty(prop.name);
            if (playerValue !== worldValue) {
                player.setDynamicProperty(prop.name, worldValue);
            }
        });
    }
};

// Player spawn event handler
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn || !player) return;

    convertTagsToProperties(player);
    ensurePlayerHasMoneyzScore(player);
    syncPlayerPropertiesWithWorld(player);
});

// Item use event listener for Moneyz Menu
world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source;
    if (data.itemStack?.typeId === "zvortex:moneyz_menu") {
        system.run(() => main(player));
    }
});

// Sync properties check interval
system.runInterval(() => {
    const syncPlayers = world.getDynamicProperty("syncPlayers");
    if (syncPlayers === "true") {
        world.getPlayers().forEach(player => {
            syncPlayerPropertiesWithWorld(player);
        });
    }
}, 90);

/**
 * Returns a random integer between min and max inclusive.
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

log("utilities.js loaded", LOG_LEVELS.DEBUG);

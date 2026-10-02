import { world, system } from "@minecraft/server";
import { main } from "./gui/moneyz_menu.js";
import { convertTagsToProperties, updateWorldProperties } from "./convertTags.js";
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from "./logger.js";
import * as Economy from "./core/economy.js";
import { ensureDefaults, syncPlayer } from "./core/config.js";
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
    if (objective === "Moneyz") return Economy.getBalance(target, useZero);
    const obj = world.scoreboard.getObjective(objective);
    if (!obj || !target) return useZero ? 0 : NaN;
    try {
        const score = obj.getScore(target);
        return score !== undefined ? score : (useZero ? 0 : NaN);
    } catch { return useZero ? 0 : NaN; }
};

/** @deprecated Prefer core/economy.js for new code. Kept for addon compatibility. */
export function updateScore(player, amount, operation = "add") {
    if (operation === "add") return Economy.deposit(player, amount, { legacy: "updateScore" });
    if (operation === "remove") {
        // Preserve historical behavior: updateScore(remove) did not enforce sufficient funds.
        const balance = Economy.getBalance(player);
        return Economy.setBalance(player, balance - Math.round(amount), { legacy: "updateScore" });
    }
    if (operation === "set") return Economy.setBalance(player, amount, { legacy: "updateScore" });
    log(`updateScore: Invalid operation "${operation}".`, LOG_LEVELS.WARN);
    return false;
}

/**
 * Returns current UTC date string formatted as YYYY-MM-DD.
 * @returns {string}
 */
export function getCurrentUTCDate() {
    const date = new Date();
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
}

const ensureWorldPropertiesExist = () => ensureDefaults();

const ensurePlayerHasMoneyzScore = (player) => {
    const moneyzScore = getScore("Moneyz", player);
    if (moneyzScore === 0) {
        updateScore(player, 0, "set");
    }
};

const syncPlayerPropertiesWithWorld = (player) => syncPlayer(player);

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

// Feature settings are synchronized on spawn and when changed through ConfigService.
// The legacy 90-tick global polling loop was intentionally removed.

export { runCommand } from "./compat/commands.js";

/**
 * Returns a random integer between min and max inclusive.
 */
export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

log("utilities.js loaded", LOG_LEVELS.DEBUG);

import { world } from "@minecraft/server";

// Legacy keys remain authoritative for compatibility with existing worlds, NPCs and command content.
export const DEFAULTS = Object.freeze({
    logLevel: "WARN", dailyReward: "25", chanceX: "2", chanceWin: "50",
    syncPlayers: "true", moneyzATM: "true", moneyzQuest: "true", moneyzSend: "true",
    oneLuckyPurchase: "true", moneyzShop: "true", moneyzDaily: "true",
    moneyzLucky: "true", moneyzChance: "true"
});

export function ensureDefaults() {
    for (const [key, value] of Object.entries(DEFAULTS)) {
        if (world.getDynamicProperty(key) === undefined) world.setDynamicProperty(key, value);
    }
}

export function get(key, fallback = DEFAULTS[key]) {
    const value = world.getDynamicProperty(key);
    return value === undefined ? fallback : value;
}

export function set(key, value) {
    world.setDynamicProperty(key, value);
    if (key === "syncPlayers" || key.startsWith("moneyz")) syncFeatureToPlayers(key, value);
}

export function bool(key, fallback = false, player) {
    const value = player?.getDynamicProperty(key) ?? get(key, fallback);
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value.toLowerCase() === "true";
    return Boolean(fallback);
}

export function number(key, fallback = 0) {
    const parsed = Number(get(key, fallback));
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function syncPlayer(player) {
    if (!player || !bool("syncPlayers", true)) return;
    for (const key of ["moneyzATM","moneyzSend","moneyzQuest","moneyzShop","moneyzDaily","moneyzLucky","moneyzChance"]) {
        const value = get(key, DEFAULTS[key]);
        if (player.getDynamicProperty(key) !== value) player.setDynamicProperty(key, value);
    }
}

function syncFeatureToPlayers(key, value) {
    if (!bool("syncPlayers", true) || key === "syncPlayers") return;
    for (const player of world.getPlayers()) player.setDynamicProperty(key, value);
}

import { world, system } from "@minecraft/server"
import { main } from './gui/moneyz_menu.js';
import { convertTagsToProperties, updateWorldProperties } from './convertTags.js';
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from './logger.js';
import "./npcInteract.js"; 

// Defer initialization until the world is loaded
world.afterEvents.worldLoad.subscribe(() => {
    // First, ensure the properties exist.
    ensureWorldPropertiesExist();
    // Now that we know the property exists, set the log level.
    setLogLevelFromWorldProperty();
    // Convert old tags for any players that might already be online.
    updateWorldProperties();
});

// Get Scoreboard info
export const getScore = (objective, target, useZero = true) => {
    const obj = world.scoreboard.getObjective(objective);
    if (!obj) {
        log(`Objective "${objective}" not found.`, LOG_LEVELS.WARN);
        return useZero ? 0 : NaN;
    }

    let participant;
    let targetNameForLog;
    
    if (typeof target === 'string') {
        participant = world.scoreboard.getParticipants().find(p => p.displayName === target);
        targetNameForLog = target;
    } else if (typeof target === 'object' && target !== null && 'name' in target) {
        participant = world.scoreboard.getParticipants().find(p => p.displayName === target.name);
        targetNameForLog = target.name;
    } else {
        log(`Invalid target provided: ${typeof target}`, LOG_LEVELS.WARN);
        return useZero ? 0 : NaN;
    }

    if (!participant) {
        log(`Participant "${targetNameForLog}" not found.`, LOG_LEVELS.WARN);
        return useZero ? 0 : NaN;
    }

    const score = obj.getScore(participant);
    return score !== undefined ? score : (useZero ? 0 : NaN);
};

// Add/Set/Remove Scores
export function updateScore(player, amount, operation = "add") { // No longer async
    log(`updateScore: Updating score for ${player?.nameTag} by ${amount} using ${operation}.`, LOG_LEVELS.DEBUG);

    if (!player) {
        log("updateScore: Invalid player provided.", LOG_LEVELS.ERROR);
        return false;
    }

    const objective = world.scoreboard.getObjective("Moneyz");
    if (!objective) {
        log(`updateScore: Objective "Moneyz" not found.`, LOG_LEVELS.ERROR);
        return false;
    }

    const roundedAmount = Math.round(amount);

    try {
        switch (operation) {
            case "add":
                objective.addScore(player, roundedAmount);
                break;
            case "remove":
                objective.addScore(player, -roundedAmount); // Removing is adding a negative
                break;
            case "set":
                objective.setScore(player, roundedAmount);
                break;
            default:
                log(`updateScore: Invalid operation "${operation}".`, LOG_LEVELS.WARN);
                return false;
        }
        log(`updateScore: ${operation}ed ${roundedAmount} to ${player.nameTag}'s Moneyz.`, LOG_LEVELS.DEBUG);
        return true;
    } catch (error) {
        log(`updateScore: Error updating score: ${error}`, LOG_LEVELS.ERROR, error.stack);
        return false;
    }
}

// Get Current Day in UTC YYYY-MM-DD format
export function getCurrentUTCDate() {
        const date = new Date();
        return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
};

// Set World Properties if they Don't Exist
const ensureWorldPropertiesExist = () => {
    log("Ensuring world properties exist...", LOG_LEVELS.DEBUG);
    const properties = [
        { name: 'logLevel', defaultValue: 'WARN' },
        { name: 'dailyReward', defaultValue: '25' },
        { name: 'chanceX', defaultValue: '2' },
        { name: 'chanceWin', defaultValue: '50' },
        { name: 'syncPlayers', defaultValue: 'true' },
        { name: 'moneyzATM', defaultValue: 'true' },
        { name: 'moneyzQuest', defaultValue: 'true' },
        { name: 'moneyzSend', defaultValue: 'true' },
        { name: 'oneLuckyPurchase', defaultValue: 'true' },
        { name: 'moneyzShop', defaultValue: 'true' },
        { name: 'moneyzDaily', defaultValue: 'true' },
        { name: 'moneyzLucky', defaultValue: 'true' },
        { name: 'moneyzChance', defaultValue: 'true' }        
    ];

    properties.forEach(prop => {
        const currentValue = world.getDynamicProperty(prop.name);
        if (currentValue === undefined) {
            world.setDynamicProperty(prop.name, prop.defaultValue);
            log(`Initialized world property ${prop.name} with value ${prop.defaultValue}`, LOG_LEVELS.INFO);
        } else {
            log(`World property ${prop.name} already exists with value ${currentValue}`, LOG_LEVELS.DEBUG);
        }
    });
};

// Set Player Moneyz score if they Don't Already
const ensurePlayerHasMoneyzScore = (player) => {
    log(`Checking Moneyz balance for ${player.nameTag}`, LOG_LEVELS.DEBUG);

    const moneyzScore = getScore('Moneyz', player);
    if (moneyzScore === 0) {
        const result = updateScore(player, 0, "set");
        if (result) {
            log(`Initialized Moneyz balance for ${player.nameTag}`, LOG_LEVELS.INFO);
        } else {
            log(`Failed to initialize Moneyz balance for ${player.nameTag}`, LOG_LEVELS.ERROR);
        }
    } else {
        log(`Moneyz balance for ${player.nameTag} is ${moneyzScore}`, LOG_LEVELS.DEBUG);
    }
};

// Sync Player Properties to World Values
const syncPlayerPropertiesWithWorld = (player) => {
    const syncPlayers = world.getDynamicProperty('syncPlayers');
    
    if (syncPlayers === 'true') {
        log(`Syncing player properties for ${player.nameTag}`, LOG_LEVELS.DEBUG);
        const properties = [
            { name: 'moneyzATM', defaultValue: 'true' },
            { name: 'moneyzSend', defaultValue: 'true' },
            { name: 'moneyzQuest', defaultValue: 'true' },
            { name: 'moneyzShop', defaultValue: 'true' },
            { name: 'moneyzDaily', defaultValue: 'true' },
            { name: 'moneyzLucky', defaultValue: 'true' },
            { name: 'moneyzChance', defaultValue: 'true' }
        ];

        properties.forEach(prop => {
            const worldValue = world.getDynamicProperty(prop.name);
            const playerValue = player.getDynamicProperty(prop.name);
            if (playerValue !== worldValue) {
                player.setDynamicProperty(prop.name, worldValue);
                log(`Syncing ${prop.name} for ${player.nameTag} to ${worldValue}`, LOG_LEVELS.INFO);
            } else {
                log(`Property ${prop.name} is already synced for ${player.nameTag}`, LOG_LEVELS.DEBUG);
            }
        });
    } else {
        log(`Syncing is disabled as syncPlayers is set to false.`, LOG_LEVELS.INFO);
    }
};

// Run these Functions when a Player Join
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;

    log(`Player ${player.nameTag} spawned`, LOG_LEVELS.INFO);
    
    // World properties are now handled by the worldLoad event.
    // We only run player-specific setup here.
    convertTagsToProperties(player);
    ensurePlayerHasMoneyzScore(player);
    syncPlayerPropertiesWithWorld(player);
    
});

// Item Use Event to Open Moneyz Menu
world.beforeEvents.itemUse.subscribe(data => {
    const player = data.source
    if (data.itemStack.typeId == "zvortex:moneyz_menu") {
        log(`Player ${player.nameTag} used Moneyz Menu item.`, LOG_LEVELS.DEBUG);
        system.run(() => main(player))
    }
});

// Sync Player Properties to World Values ever 90 seconds
// This can spam the Creator Logs if log level is set to DEBUG in Moneyz Menu
system.runInterval(() => {
    const syncPlayers = world.getDynamicProperty('syncPlayers');
    
    if (syncPlayers === 'true') {
        log(`Running property sync check...`, LOG_LEVELS.DEBUG);
        world.getPlayers().forEach(player => {
            syncPlayerPropertiesWithWorld(player);
        });
    } else {
        //log("Skipping property sync check (syncPlayers is false)", LOG_LEVELS.DEBUG)
    }
}, 90);


// Random Number for Chance Games
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const result = Math.floor(Math.random() * (max - min + 1)) + min;
  log(`Generated random integer between ${min} and ${max}: ${result}`, LOG_LEVELS.DEBUG);
  return result;
};

log('utilities.js loaded', LOG_LEVELS.DEBUG);
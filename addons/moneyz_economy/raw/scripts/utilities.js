import { world, system } from "@minecraft/server"
import { main } from './gui/moneyz_menu.js';
import { convertTagsToProperties, updateWorldProperties } from './convertTags.js';
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from './logger.js';

// Use World Property for Log Level
setLogLevelFromWorldProperty()

// Convert moneyzAutoTag scoreboard to World Properties
updateWorldProperties();

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
export async function updateScore(player, amount, operation = "add") {
    log(`updateScore: Updating score for ${player?.nameTag} by ${amount} using ${operation}.`, LOG_LEVELS.DEBUG);

    if (!player) {
        log("updateScore: Invalid player provided.", LOG_LEVELS.ERROR);
        return false;
    }

    const playerName = player.nameTag;
    const roundedAmount = Math.round(amount);
    log(`updateScore: Rounded amount to ${roundedAmount}.`, LOG_LEVELS.DEBUG);

    try {
        let command = `scoreboard players ${operation} "${playerName}" Moneyz ${roundedAmount}`;
        let commandResult = await player.runCommandAsync(command);
        if(commandResult.successCount === undefined || commandResult.successCount === 0){
            log(`updateScore: Command failed: ${command}`, LOG_LEVELS.ERROR)
            return false;
        }
        log(`updateScore: ${operation}ed ${roundedAmount} to ${playerName}'s Moneyz.`, LOG_LEVELS.DEBUG);
        return true;
    } catch (error) {
        log(`updateScore: Error updating score: ${error}`, LOG_LEVELS.ERROR);
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
        { name: 'dailyReward', defaultValue: '0' },
        { name: 'chanceX', defaultValue: '0' },
        { name: 'chanceWin', defaultValue: '0' },
        { name: 'syncPlayers', defaultValue: 'true' },
        { name: 'moneyzATM', defaultValue: 'true' },
        { name: 'moneyzSend', defaultValue: 'true' },
        { name: 'oneLuckyPurchase', defaultValue: 'true' },
        { name: 'moneyzShop', defaultValue: 'false' },
        { name: 'moneyzDaily', defaultValue: 'false' },
        { name: 'moneyzLucky', defaultValue: 'false' },
        { name: 'moneyzChance', defaultValue: 'false' }        
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

    const scoreData = getScore('Moneyz', player);
    if (!scoreData) { 
        updateScore(player, 0, "set");
        log(`Initialized Moneyz balance for ${player.nameTag}`, LOG_LEVELS.INFO);
    } else {
        log(`Moneyz balance for ${player.nameTag} is ${scoreData.score}`, LOG_LEVELS.DEBUG);
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
            { name: 'moneyzShop', defaultValue: 'false' },
            { name: 'moneyzDaily', defaultValue: 'false' },
            { name: 'moneyzLucky', defaultValue: 'false' },
            { name: 'moneyzChance', defaultValue: 'false' }
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
    
    convertTagsToProperties(player);
    ensureWorldPropertiesExist();
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
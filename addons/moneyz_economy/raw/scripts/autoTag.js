import { world, system } from "@minecraft/server"
import { getScore } from './utilities.js';
import { convertTagsToProperties, updateWorldProperties } from './convertTags.js';
import { log, LOG_LEVELS, setLogLevelFromWorldProperty } from './logger.js';

setLogLevelFromWorldProperty()

const ensureWorldPropertiesExist = () => {
    log("Ensuring world properties exist...", LOG_LEVELS.DEBUG);
    const properties = [
        { name: 'logLevel', defaultValue: 'WARN' }
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

const ensurePlayerHasMoneyzScore = (player) => {
    log(`Checking Moneyz balance for ${player.nameTag}`, LOG_LEVELS.DEBUG);
    const moneyzScore = getScore('Moneyz', player.nameTag, false);
    if (isNaN(moneyzScore)) {
        player.runCommandAsync(`scoreboard players set ${player.nameTag} Moneyz 0`);
        log(`Initialized Moneyz balance for ${player.nameTag}`, LOG_LEVELS.INFO);
    } else {
        log(`Moneyz balance for ${player.nameTag} is ${moneyzScore}`, LOG_LEVELS.DEBUG);
    }
};

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

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;

    log(`Player ${player.nameTag} spawned`, LOG_LEVELS.INFO);
    ensureWorldPropertiesExist();
    ensurePlayerHasMoneyzScore(player);
    syncPlayerPropertiesWithWorld(player);
    convertTagsToProperties(player);
    updateWorldProperties();
});

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

log('autoTag.js loaded', LOG_LEVELS.DEBUG);
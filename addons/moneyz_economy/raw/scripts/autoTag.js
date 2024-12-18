import { world, system } from "@minecraft/server"
import { getScore } from './utilities.js';
import { convertTagsToProperties, updateWorldProperties } from './convertTags.js';

const ensureWorldPropertiesExist = () => {
    const properties = [
        { name: 'moneyzATM', defaultValue: true },
        { name: 'moneyzSend', defaultValue: true },
        { name: 'oneLuckyPurchase', defaultValue: true },
        { name: 'moneyzShop', defaultValue: false },
        { name: 'moneyzLucky', defaultValue: false },
        { name: 'moneyzDaily', defaultValue: false },
        { name: 'syncPlayers', defaultValue: false },
        { name: 'dailyReward', defaultValue: 0 }
    ];

    properties.forEach(prop => {
        const currentValue = world.getDynamicProperty(prop.name);
        if (currentValue === undefined) {
            world.setDynamicProperty(prop.name, prop.defaultValue);
            console.log(`Initialized world property ${prop.name} with value ${prop.defaultValue}`);
        }
    });
};

const ensurePlayerHasMoneyzScore = (player) => {
    console.log(`Checking Moneyz balance for ${player.nameTag}`);
    const moneyzScore = getScore('Moneyz', player.nameTag, false);
    if (isNaN(moneyzScore)) {
        player.runCommandAsync(`scoreboard players set ${player.nameTag} Moneyz 0`);
        console.log(`Initialized Moneyz balance for ${player.nameTag}`);
    }
};

const syncPlayerPropertiesWithWorld = (player) => {
    const syncPlayers = world.getDynamicProperty('syncPlayers');
    
    if (syncPlayers === true) {
        const properties = [
            { name: 'moneyzATM', defaultValue: true },
            { name: 'moneyzSend', defaultValue: true },
            { name: 'moneyzShop', defaultValue: false },
            { name: 'moneyzLucky', defaultValue: false },
            { name: 'moneyzDaily', defaultValue: false }
        ];

        properties.forEach(prop => {
            const worldValue = world.getDynamicProperty(prop.name);
            const playerValue = player.getDynamicProperty(prop.name);
            if (playerValue !== worldValue) {
                player.setDynamicProperty(prop.name, worldValue);
                console.log(`Syncing ${prop.name} for ${player.nameTag} to ${worldValue}`);
            }
        });
    } else {
        console.log(`Syncing is disabled as syncPlayers is set to false.`);
    }
};

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;

    console.log(`Checking world properties and syncing properties for ${player.nameTag}`);
    ensureWorldPropertiesExist();
    ensurePlayerHasMoneyzScore(player);
    syncPlayerPropertiesWithWorld(player);
    convertTagsToProperties(player);
    updateWorldProperties();
});

system.runInterval(() => {
    const syncPlayers = world.getDynamicProperty('syncPlayers');
    
    if (syncPlayers === true) {
        world.getPlayers().forEach(player => {
            syncPlayerPropertiesWithWorld(player);
        });
    } else {

    }
}, 90);


console.log('autoTag.js loaded');
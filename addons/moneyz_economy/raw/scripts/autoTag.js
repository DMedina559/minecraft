import { world, system } from "@minecraft/server"

// Gets Scoreboards Data

const getScore = (objective, target, useZero = true) => {
    try {
        const obj = world.scoreboard.getObjective(objective);
        if (typeof target === 'string') {
            return obj.getScore(obj.getParticipants().find(v => v.displayName === target));
        }
        return obj.getScore(target.scoreboard);
    } catch {
        return useZero ? 0 : NaN;
    }
};

//Trigger Events When Player Joins World

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;
    console.log(`Checking auto tags for ${player.nameTag}`);
    applyAutoTags(player);
    console.log(`Checking ${player.nameTag}s Moneyz balance`);
    ensurePlayerHasMoneyzScore(player);
});

// Checks if Moneyz Auto Taggging is Enabled and Adds the Enabled Tags to Players When They Join if They Don't Already Have Tag

async function applyAutoTags(player) {
    if (getScore('moneyzAutoTag', 'moneyzShop') > 0) {
        const hasShopTag = await player.hasTag('moneyzShop');
        if (!hasShopTag) {
            player.runCommandAsync(`tag ${player.nameTag} add moneyzShop`);
            console.log(`Applying moneyzShop tag for ${player.nameTag}`);
        }
    }

    if (getScore('moneyzAutoTag', 'moneyzATM') > 0) {
        const hasATMTag = await player.hasTag('moneyzATM');
        if (!hasATMTag) {
            player.runCommandAsync(`tag ${player.nameTag} add moneyzATM`);
            console.log(`Applying moneyzATM tag for ${player.nameTag}`);
        }
    }

    if (getScore('moneyzAutoTag', 'moneyzSend') > 0) {
        const hasSendTag = await player.hasTag('moneyzSend');
        if (!hasSendTag) {
            player.runCommandAsync(`tag ${player.nameTag} add moneyzSend`);
            console.log(`Applying moneyzSend tag for ${player.nameTag}`);
        }
    }
}

//Ensures Player has a Moneyz Score

const ensurePlayerHasMoneyzScore = (player) => {
    const moneyzScore = getScore('Moneyz', player.nameTag, false);
    if (isNaN(moneyzScore)) {
        player.runCommandAsync(`scoreboard players set ${player.nameTag} Moneyz 0`);
        console.log(`Initialized Moneyz balance for ${player.nameTag}`);
    }
};

console.log('autoTag.js loaded')
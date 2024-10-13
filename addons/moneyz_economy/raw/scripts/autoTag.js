import { world, system } from "@minecraft/server"

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

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;
    console.log(`Checking auto tags for ${player.nameTag}`);
    applyAutoTags(player);
    console.log(`Checking ${player.nameTag}s Moneyz balance`);
    ensurePlayerHasMoneyzScore(player);
});

function applyAutoTags(player) {
    if (getScore('moneyzAutoTag', 'moneyzShop') > 0) {
        player.runCommandAsync(`tag ${player.nameTag} add moneyzShop`);
        console.log(`Applying moneyzShop tag for ${player.nameTag}`);
    }
    if (getScore('moneyzAutoTag', 'moneyzATM') > 0) {
        player.runCommandAsync(`tag ${player.nameTag} add moneyzATM`);
        console.log(`Applying moneyzATM tag for ${player.nameTag}`);
    }
    if (getScore('moneyzAutoTag', 'moneyzSend') > 0) {
        player.runCommandAsync(`tag ${player.nameTag} add moneyzSend`);
        console.log(`Applying moneyzSend tag for ${player.nameTag}`);
    }
}

const ensurePlayerHasMoneyzScore = (player) => {
    const moneyzScore = getScore('Moneyz', player.nameTag, false);
    if (isNaN(moneyzScore)) {
        player.runCommandAsync(`scoreboard players set ${player.nameTag} Moneyz 0`);
        console.log(`Initialized Moneyz balance for ${player.nameTag}`);
    }
};

console.log('autoTag.js loaded')
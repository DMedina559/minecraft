import { world, system } from "@minecraft/server"

const getScore = (objective, target, useZero = true) => {
    try {
        const obj = world.scoreboard.getObjective(objective);
        if (typeof target == 'string') {
            return obj.getScore(obj.getParticipants().find(v => v.displayName === target));
        }
        return obj.getScore(target.scoreboard);
    } catch {
        return useZero ? 0 : NaN;
    }
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;
    applyAutoTags(player);
    console.log(`Applying auto tags for ${player.nameTag}`);
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

console.log('autoTag loaded')
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
    system.runTimeout(() => {
        if (world.getPlayers().some(p => p.nameTag === player.nameTag)) {
            console.log(`Applying auto tags for ${player.nameTag}`);
            applyAutoTags(player);
        } else {
            console.error(`${player.nameTag} is no longer valid.`);
        }
    }, 600);
});

function applyAutoTags(player) {
    if (getScore('moneyzAutoTag', 'moneyzShop') > 0) {
        player.runCommandAsync(`tag ${player.nameTag} add moneyzShop`);
    }
    if (getScore('moneyzAutoTag', 'moneyzATM') > 0) {
        player.runCommandAsync(`tag ${player.nameTag} add moneyzATM`);
    }
    if (getScore('moneyzAutoTag', 'moneyzSend') > 0) {
        player.runCommandAsync(`tag ${player.nameTag} add moneyzSend`);
    }
}

console.warn('autoTag loaded')
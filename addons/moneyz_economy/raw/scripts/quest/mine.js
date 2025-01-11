import { world, system } from "@minecraft/server";
import { updateScore, getCurrentUTCDate } from '../utilities.js';
import { getActiveQuest, completeQuest } from '../gui/quest_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

export const ORE_BREAK_REWARDS = {
    "minecraft:coal_ore": 5,
    "minecraft:copper_ore": 8,
    "minecraft:gold_ore": 20,
    "minecraft:iron_ore": 10,
    "minecraft:diamond_ore": 50,
    "minecraft:emerald_ore": 75
};

world.beforeEvents.playerBreakBlock.subscribe(event => {
    const player = event.player;
    const brokenBlock = event.block;  
    log(`Player ${player.nameTag} tried to break block: ${brokenBlock.typeId}`, LOG_LEVELS.DEBUG);

    if (player) {
        const activeQuest = getActiveQuest(player);

        if (activeQuest && activeQuest.objective && activeQuest.objective.type === "break") {
            const blockTypes = activeQuest.objective.blockTypes;
            
            if (blockTypes && Array.isArray(blockTypes) && blockTypes.includes(brokenBlock.typeId)) {
                activeQuest.objective.count -= 1;

                if (activeQuest.objective.count <= 0) {
                    completeQuest(player, activeQuest);
                } else {
                    player.setDynamicProperty("activeQuest", JSON.stringify(activeQuest));
                    player.sendMessage(`§eYou still need to mine ${activeQuest.objective.count} more ${blockTypes.map(type => type.replace("minecraft:", "").replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())).join(", ")}.`);
                }

                if (ORE_BREAK_REWARDS[brokenBlock.typeId]) {
                    const rewardAmount = ORE_BREAK_REWARDS[brokenBlock.typeId];
                    updateScore(player, rewardAmount, "add");
                    player.sendMessage(`§aYou earned ${rewardAmount} Moneyz for mining ${brokenBlock.typeId.replace("minecraft:", "").replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())}!`);
                }
                event.cancel = true;
                const blockPosition = brokenBlock.location;
                const positionString = `${blockPosition.x} ${blockPosition.y} ${blockPosition.z}`;
                player.runCommandAsync(`setblock ${positionString} minecraft:air replace`);
                log(`Placed air at:`, LOG_LEVELS.DEBUG, positionString);
            }
        }
    }
}, {
    blockTypes: Object.keys(ORE_BREAK_REWARDS)
});

log('mine.js loaded', LOG_LEVELS.DEBUG);
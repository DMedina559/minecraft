import { world, system } from "@minecraft/server";
import { updateScore, getCurrentUTCDate } from '../utilities.js';
import { getActiveQuest, completeQuest } from '../gui/quest_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

export const ORE_BREAK_REWARDS = {
    "minecraft:coal_ore": 5,
    "minecraft:deepslate_coal_ore": 5,
    "minecraft:copper_ore": 8,
    "minecraft:deepslate_copper_ore": 8,
    "minecraft:iron_ore": 10,
    "minecraft:deepslate_iron_ore": 10,
    "minecraft:gold_ore": 20,
    "minecraft:deepslate_gold_ore": 20,
    "minecraft:diamond_ore": 50,
    "minecraft:deepslate_diamond_ore": 50,
    "minecraft:emerald_ore": 75,
    "minecraft:deepslate_emerald_ore": 75,
    "minecraft:lapis_ore": 15,
    "minecraft:deepslate_lapis_ore": 15,
    "minecraft:redstone_ore": 12,
    "minecraft:deepslate_redstone_ore": 12,
    "minecraft:nether_gold_ore": 10,
    "minecraft:quartz_ore": 10
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
                // Replace the block with air using the modern API
                player.dimension.setBlockPermutation(brokenBlock.location, world.getBlockPermutation("minecraft:air"));
                log(`Set block to air at: ${brokenBlock.location.x}, ${brokenBlock.location.y}, ${brokenBlock.location.z}`, LOG_LEVELS.DEBUG);
            }
        }
    }
}, {
    blockTypes: Object.keys(ORE_BREAK_REWARDS)
});

log('mine.js loaded', LOG_LEVELS.DEBUG);
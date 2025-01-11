import { world, system } from "@minecraft/server";
import { updateScore, getCurrentUTCDate } from '../utilities.js';
import { getActiveQuest, completeQuest } from '../gui/quest_menu.js';
import { log, LOG_LEVELS } from '../logger.js';

export const CROP_PLANT_REWARDS = {
    "minecraft:wheat": 3,
    "minecraft:potato": 3,
    "minecraft:carrot": 3,
    "minecraft:beetroot": 3,
    "minecraft:reeds": 3
};

world.afterEvents.playerPlaceBlock.subscribe(event => {
    try {
        const player = event.player;
        const placedBlock = event.block;
        log(`Player ${player.nameTag} placed block: ${placedBlock.typeId}`, LOG_LEVELS.DEBUG);

        if (player) {
            const activeQuest = getActiveQuest(player);

            if (activeQuest && activeQuest.objective && activeQuest.objective.type === "plant") {
                const cropTypes = activeQuest.objective.cropTypes;

                if (cropTypes && Array.isArray(cropTypes) && cropTypes.includes(placedBlock.typeId)) {
                    activeQuest.objective.count -= 1;

                    if (activeQuest.objective.count <= 0) {
                        completeQuest(player, activeQuest);
                    } else {
                        player.setDynamicProperty("activeQuest", JSON.stringify(activeQuest));
                        const cropName = placedBlock.typeId.replace("minecraft:", "").replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                        player.sendMessage(`§eYou still need to plant ${activeQuest.objective.count} more ${cropName} seeds.`);
                    }

                    const cropName = placedBlock.typeId.replace("minecraft:", "").replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
                    const rewardAmount = CROP_PLANT_REWARDS[placedBlock.typeId] || 0;
                    updateScore(player, rewardAmount, "add");
                    player.sendMessage(`§aYou earned ${rewardAmount} Moneyz for planting ${cropName} seeds!`);
                }
            }
        }
    } catch (error) {
        log(`Error in blockPlace event: ${error.message}`, LOG_LEVELS.ERROR, error);
    }
}, { blockTypes: Object.keys(CROP_PLANT_REWARDS) });

log('plant.js loaded', LOG_LEVELS.DEBUG);
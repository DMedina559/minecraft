import { world } from "@minecraft/server";
import { updateScore } from "../utilities.js";
import { getActiveQuest, completeQuest } from "../gui/quest_menu.js";
import { log, LOG_LEVELS } from "../logger.js";

export const CROP_PLANT_REWARDS = {
    "minecraft:wheat": 3,
    "minecraft:potatoes": 3,
    "minecraft:carrots": 3,
    "minecraft:beetroot": 3,
    "minecraft:reeds": 3
};

world.afterEvents.playerPlaceBlock.subscribe(event => {
    try {
        const player = event.player;
        const placedBlock = event.block;

        if (!player || !placedBlock) return;

        const activeQuest = getActiveQuest(player);

        if (activeQuest?.objective?.type === "plant") {
            const cropTypes = activeQuest.objective.cropTypes;

            if (Array.isArray(cropTypes) && cropTypes.includes(placedBlock.typeId)) {
                activeQuest.objective.count -= 1;
                const cropName = placedBlock.typeId.replace("minecraft:", "").replace(/_/g, " ");

                if (activeQuest.objective.count <= 0) {
                    completeQuest(player, activeQuest);
                    try { player.onScreenDisplay.setActionBar("§aQuest Completed!"); } catch {}
                } else {
                    player.setDynamicProperty("activeQuest", JSON.stringify(activeQuest));
                    try { player.onScreenDisplay.setActionBar(`§eQuest Progress: ${activeQuest.objective.count} more ${cropName} to plant`); } catch {}
                }

                const rewardAmount = CROP_PLANT_REWARDS[placedBlock.typeId] || 0;
                updateScore(player, rewardAmount, "add");
            }
        }
    } catch (error) {
        log(`Error in playerPlaceBlock event: ${error.message}`, LOG_LEVELS.ERROR);
    }
}, { blockTypes: Object.keys(CROP_PLANT_REWARDS) });

log("plant.js loaded", LOG_LEVELS.DEBUG);
